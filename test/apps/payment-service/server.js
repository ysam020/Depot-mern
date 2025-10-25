import grpc from "@grpc/grpc-js";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@depot/prisma";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

import {
  PaymentServiceService,
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "@depot/proto-defs/payment";

import { OrderServiceClient } from "@depot/proto-defs/order";

dotenv.config();

const ORDER_SERVICE_ADDRESS = process.env.ORDER_SERVICE_ADDRESS;
const orderClient = new OrderServiceClient(
  ORDER_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService {
  static verifySignature(orderId, paymentId, signature) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  static forwardAuthMetadata(sourceMetadata) {
    const metadata = new grpc.Metadata();
    const authHeader = sourceMetadata.get("authorization")[0];

    if (authHeader) {
      metadata.add("authorization", authHeader);
    } else {
      console.warn("⚠️ No authorization header found in metadata");
    }

    return metadata;
  }

  static async clearUserCart(userId) {
    try {
      const userCart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (userCart) {
        await prisma.cart_items.deleteMany({
          where: { cart_id: userCart.id },
        });
      }
    } catch (err) {
      console.error("⚠️ Failed to clear cart:", err);
    }
  }

  static async createOrder(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const { amount, currency, receipt } = call.request;

      // Validate amount
      if (!amount || amount <= 0) {
        console.error("Amount validation failed:", amount);
        return BaseGrpcService.sendError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "Amount must be greater than 0"
        );
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
      });

      // Cleaner response creation
      callback(
        null,
        BaseGrpcService.successResponse(CreateOrderResponse, {
          razorpay_order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: process.env.RAZORPAY_KEY_ID,
        })
      );
    });
  }

  static async verifyPayment(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        user_id,
        cart_items,
        shipping_address,
      } = call.request;

      // Step 1: Verify signature
      if (
        !PaymentService.verifySignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        )
      ) {
        console.error("Signature verification failed");
        return BaseGrpcService.sendError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "Invalid payment signature"
        );
      }

      // Step 2: Fetch payment details from Razorpay
      const razorpayPaymentDetails =
        await razorpay.payments.fetch(razorpay_payment_id);

      // Step 3: Verify payment status
      if (razorpayPaymentDetails.status !== "captured") {
        console.error(`Payment not captured: ${razorpayPaymentDetails.status}`);
        return BaseGrpcService.sendError(
          callback,
          grpc.status.FAILED_PRECONDITION,
          `Payment not captured. Status: ${razorpayPaymentDetails.status}`
        );
      }

      // Step 4: Save payment to database
      const payment = await prisma.payments.create({
        data: {
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          amount,
          currency: razorpayPaymentDetails.currency || "INR",
          status: "success",
          payment_method: razorpayPaymentDetails.method || "unknown",
          user_id: user_id,
        },
      });

      // Step 5: Prepare order items with snake_case for Order Service
      const orderItems = cart_items.map((item) => ({
        id: 0,
        order_id: 0,
        product_id: parseInt(item.id) || 0,
        quantity: parseInt(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        title: String(item.title || ""),
        image: String(item.image || ""),
      }));

      const orderRequest = {
        user_id: user_id,
        items: orderItems,
        total: parseFloat(amount) || 0,
        payment_id: parseInt(payment.id) || 0,
        shipping_address: shipping_address
          ? JSON.stringify(shipping_address)
          : "",
      };

      // Step 6: Forward authorization metadata
      const metadata = PaymentService.forwardAuthMetadata(call.metadata);

      // Step 7: Create order via Order Service
      const orderResponse = await new Promise((resolve, reject) => {
        orderClient.createOrder(
          orderRequest,
          metadata,
          (orderErr, response) => {
            if (orderErr) {
              reject(orderErr);
            } else {
              resolve(response);
            }
          }
        );
      });

      // Step 8: Update payment with order_id
      try {
        await prisma.payments.update({
          where: { id: payment.id },
          data: { order_id: orderResponse.order.id },
        });
      } catch (updateErr) {
        console.error("⚠️ Payment Update Error:", updateErr);
      }

      // Step 9: Clear user's cart
      await PaymentService.clearUserCart(user_id);

      // Step 10: Send final response
      callback(
        null,
        BaseGrpcService.successResponse(VerifyPaymentResponse, {
          success: true,
          message: "Payment verified and order created successfully",
          payment: {
            id: payment.id.toString(),
            order_id: orderResponse.order.id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            user_id: payment.user_id,
            payment_method: payment.payment_method,
          },
        })
      );
    });
  }
}

const paymentService = BaseGrpcService.createService(
  "PaymentService",
  PaymentServiceService,
  PaymentService,
  { port: process.env.PAYMENT_SERVICE_PORT || 50055 }
);

// Start the server
paymentService.start().catch((err) => {
  console.error("Failed to start PaymentService:", err);
  process.exit(1);
});
