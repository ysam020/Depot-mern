import express from "express";
import { PaymentServiceClient } from "@depot/proto-defs/payment";
import {
  grpcClientManager,
  GrpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
  authHelper,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const paymentClient = grpcClientManager.getClient(
  "PAYMENT_SERVICE",
  PaymentServiceClient
);

// Create Razorpay order
router.post("/create-order", (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  if (!amount) {
    return ResponseFormatter.validationError(res, {
      amount: "Amount is required",
    });
  }

  paymentClient.createOrder(
    { amount, currency, receipt },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        // Convert snake_case from gRPC to camelCase for REST API
        ResponseFormatter.success(
          res,
          {
            razorpayOrderId: response.razorpay_order_id,
            amount: response.amount,
            currency: response.currency,
            keyId: response.key_id,
          },
          "Order created successfully"
        );
      },
      "Failed to create order"
    )
  );
});

// Verify payment
router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    cart_items,
    shipping_address,
  } = req.body;

  const userId = authHelper.getUserIdFromRequest(req);

  if (!userId) {
    return ResponseFormatter.unauthorized(res);
  }

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return ResponseFormatter.validationError(res, {
      razorpay_order_id: razorpay_order_id ? null : "Order ID is required",
      razorpay_payment_id: razorpay_payment_id
        ? null
        : "Payment ID is required",
      razorpay_signature: razorpay_signature ? null : "Signature is required",
    });
  }

  if (!cart_items || cart_items.length === 0) {
    return ResponseFormatter.validationError(res, {
      cart_items: "Cart items are required",
    });
  }

  if (!shipping_address) {
    return ResponseFormatter.validationError(res, {
      shipping_address: "Shipping address is required",
    });
  }

  // Forward request to payment service
  const verifyRequest = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    user_id: userId,
    cart_items,
    shipping_address,
  };

  paymentClient.verifyPayment(
    verifyRequest,
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          {
            payment: response.payment,
            order: response.order,
          },
          response.message || "Payment verified and order created successfully"
        );
      },
      "Payment verification failed"
    )
  );
});

export default router;
