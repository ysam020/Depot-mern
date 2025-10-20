import express from "express";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import { PaymentServiceClient } from "../../../dist/payment.js";
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

// Create Razorpay order
router.post("/create-order", (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Amount is required",
    });
  }

  paymentClient.createOrder(
    { amount, currency, receipt },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Create order error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response,
        message: "Order created successfully",
      });
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
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment details",
    });
  }

  if (!cart_items || cart_items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart items are required",
    });
  }

  if (!shipping_address) {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required",
    });
  }

  paymentClient.verifyPayment(
    {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      user_id,
      cart_items,
      shipping_address,
    },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Verify payment error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response,
        message: "Payment verified and order created successfully",
      });
    }
  );
});

export default router;
