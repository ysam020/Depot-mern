import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { PaymentServiceClient } from "@depot/proto-defs/payment";

class PaymentController extends BaseController {
  constructor() {
    const paymentClient = grpcClientManager.getClient(
      "PAYMENT_SERVICE",
      PaymentServiceClient
    );
    super(paymentClient);
  }

  createOrder = async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount) {
      return this.sendValidationError(res, {
        amount: "Amount is required",
      });
    }

    await this.executeGrpcCall(
      req,
      res,
      "createOrder",
      { amount, currency, receipt },
      {
        transformer: (response) => ({
          razorpayOrderId: response.razorpay_order_id,
          amount: response.amount,
          currency: response.currency,
          keyId: response.key_id,
        }),
        successMessage: "Order created successfully",
        errorMessage: "Failed to create order",
        includeMetadata: true,
      }
    );
  };

  verifyPayment = async (req, res) => {
    const userId = this.getUserId(req);

    if (!userId) {
      return this.sendUnauthorized(res);
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      cart_items,
      shipping_address,
    } = req.body;

    // Validate Razorpay fields
    const razorpayErrors = this.validateRequiredFields(req.body, [
      {
        field: "razorpay_order_id",
        message: "Order ID is required",
      },
      {
        field: "razorpay_payment_id",
        message: "Payment ID is required",
      },
      {
        field: "razorpay_signature",
        message: "Signature is required",
      },
    ]);

    if (razorpayErrors) {
      return this.sendValidationError(res, razorpayErrors);
    }

    // Validate cart items
    if (!cart_items || cart_items.length === 0) {
      return this.sendValidationError(res, {
        cart_items: "Cart items are required",
      });
    }

    // Validate shipping address
    if (!shipping_address) {
      return this.sendValidationError(res, {
        shipping_address: "Shipping address is required",
      });
    }

    const verifyRequest = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      user_id: userId,
      cart_items,
      shipping_address,
    };

    await this.executeGrpcCall(req, res, "verifyPayment", verifyRequest, {
      transformer: (response) => ({
        payment: response.payment,
        order: response.order,
      }),
      successMessage: (response) =>
        response.message || "Payment verified and order created successfully",
      errorMessage: "Payment verification failed",
      includeMetadata: true,
    });
  };
}

export default new PaymentController();
