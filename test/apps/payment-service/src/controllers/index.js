import grpc from "@grpc/grpc-js";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import { OrderServiceClient } from "@depot/proto-defs/order";
import { createOrderHandler } from "../handlers/createOrder.handler.js";
import { verifyPaymentHandler } from "../handlers/verifyPayment.handler.js";

class PaymentController extends BaseServiceController {
  constructor() {
    super(prisma.payments, process.env.JWT_SECRET);
    this.grpc = grpc;

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    this.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    this.orderClient = new OrderServiceClient(
      process.env.ORDER_SERVICE_ADDRESS,
      grpc.credentials.createInsecure()
    );

    this.cartsModel = prisma.carts;
    this.cartItemsModel = prisma.cart_items;
  }

  async createRazorpayOrder(amount, currency, receipt) {
    return await this.razorpay.orders.create({
      amount,
      currency,
      receipt,
    });
  }

  async fetchRazorpayPayment(paymentId) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  verifyRazorpaySignature(orderId, paymentId, signature) {
    const generatedSignature = crypto
      .createHmac("sha256", this.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  async savePayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount,
    currency,
    paymentMethod,
    userId
  ) {
    return await this.create({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount,
      currency,
      status: "success",
      payment_method: paymentMethod,
      user_id: userId,
    });
  }

  async linkPaymentToOrder(paymentId, orderId) {
    try {
      return await this.update({ id: paymentId }, { order_id: orderId });
    } catch (err) {
      this.logError("Payment Update Error:", err);
      return null;
    }
  }

  prepareOrderItems(cartItems) {
    return cartItems.map((item) => ({
      id: 0,
      order_id: 0,
      product_id: parseInt(item.id) || 0,
      quantity: parseInt(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      title: String(item.title || ""),
      image: String(item.image || ""),
    }));
  }

  forwardAuthMetadata(sourceMetadata) {
    const metadata = new grpc.Metadata();
    const authHeader = sourceMetadata.get("authorization")[0];

    if (authHeader) {
      metadata.add("authorization", authHeader);
    } else {
      console.warn("⚠️ No authorization header found in metadata");
    }

    return metadata;
  }

  async createOrderViaOrderService(
    userId,
    items,
    total,
    paymentId,
    shippingAddress,
    sourceMetadata
  ) {
    try {
      const orderRequest = {
        user_id: userId,
        items,
        total: parseFloat(total) || 0,
        payment_id: parseInt(paymentId) || 0,
        shipping_address: shippingAddress
          ? JSON.stringify(shippingAddress)
          : "",
      };

      const metadata = this.forwardAuthMetadata(sourceMetadata);

      return await new Promise((resolve, reject) => {
        this.orderClient.createOrder(
          orderRequest,
          metadata,
          (orderErr, response) => {
            if (orderErr) {
              this.logError("Order creation failed:", orderErr);
              reject(orderErr);
            } else {
              resolve(response);
            }
          }
        );
      });
    } catch (err) {
      this.logError("Failed to create order via Order Service:", err);
      return null;
    }
  }

  async clearUserCart(userId) {
    try {
      const userCart = await this.cartsModel.findUnique({
        where: { user_id: userId },
      });

      if (userCart) {
        await this.cartItemsModel.deleteMany({
          where: { cart_id: userCart.id },
        });
        this.log(`Cart cleared for user ${userId}`);
      }
    } catch (err) {
      this.logError("Failed to clear cart:", err);
    }
  }

  async createOrder(call, callback) {
    await createOrderHandler(this, call, callback);
  }

  async verifyPayment(call, callback) {
    await verifyPaymentHandler(this, call, callback);
  }
}

export default PaymentController;
