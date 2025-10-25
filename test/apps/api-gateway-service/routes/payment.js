import express from "express";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import { PaymentServiceClient } from "@depot/proto-defs/payment";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const PAYMENT_SERVICE_ADDRESS = process.env.PAYMENT_SERVICE_ADDRESS;

const paymentClient = new PaymentServiceClient(
  PAYMENT_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

// Helper to attach JWT to gRPC metadata
function createMetadata(req) {
  const metadata = new grpc.Metadata();
  if (req.headers.authorization) {
    metadata.add("authorization", req.headers.authorization);
  }
  return metadata;
}

// Helper to get user ID from token
function getUserIdFromToken(req) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// Create order
router.post("/create-order", (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  if (!amount) {
    console.error("Amount validation failed");
    return res.status(400).json({
      success: false,
      message: "Amount is required",
    });
  }

  const grpcRequest = { amount, currency, receipt };

  paymentClient.createOrder(
    grpcRequest,
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Create order gRPC error:", {
          code: err.code,
          message: err.message,
          details: err.details,
        });
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      const formattedResponse = {
        success: true,
        data: {
          razorpayOrderId: response.razorpay_order_id,
          amount: response.amount,
          currency: response.currency,
          keyId: response.key_id,
        },
        message: "Order created successfully",
      };

      res.json(formattedResponse);
    }
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

  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    console.error("User authentication failed");
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error("Missing payment details");
    return res.status(400).json({
      success: false,
      message: "Missing payment details",
    });
  }

  if (!cart_items || cart_items.length === 0) {
    console.error("Cart items validation failed");
    return res.status(400).json({
      success: false,
      message: "Cart items are required",
    });
  }

  if (!shipping_address) {
    console.error("Shipping address validation failed");
    return res.status(400).json({
      success: false,
      message: "Shipping address is required",
    });
  }

  const verifyPaymentRequest = {
    razorpay_order_id: String(razorpay_order_id),
    razorpay_payment_id: String(razorpay_payment_id),
    razorpay_signature: String(razorpay_signature),
    amount: parseInt(amount) || 0,
    user_id: parseInt(user_id) || 0,
    cart_items: cart_items.map((item) => ({
      id: parseInt(item.id) || 0,
      title: String(item.title || ""),
      price: parseInt(item.price) || 0,
      image: String(item.image || ""),
      quantity: parseInt(item.quantity) || 0,
    })),
    shipping_address: {
      first_name: String(shipping_address.first_name || ""),
      last_name: String(shipping_address.last_name || ""),
      address: String(shipping_address.address || ""),
      city: String(shipping_address.city || ""),
      state: String(shipping_address.state || ""),
      pincode: String(shipping_address.pincode || ""),
      phone: String(shipping_address.phone || ""),
    },
  };

  paymentClient.verifyPayment(
    verifyPaymentRequest,
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Verify payment gRPC error:", {
          code: err.code,
          message: err.message,
          details: err.details,
        });
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      const formattedResponse = {
        success: true,
        data: {
          payment: {
            id: response.payment.id,
            orderId: response.payment.order_id,
            order_id: response.payment.order_id,
            razorpayOrderId: response.payment.razorpay_order_id,
            razorpayPaymentId: response.payment.razorpay_payment_id,
            razorpaySignature: response.payment.razorpay_signature,
            amount: response.payment.amount,
            currency: response.payment.currency,
            status: response.payment.status,
            userId: response.payment.user_id,
            paymentMethod: response.payment.payment_method,
          },
        },
        message: "Payment verified and order created successfully",
      };

      res.json(formattedResponse);
    }
  );
});

export default router;
