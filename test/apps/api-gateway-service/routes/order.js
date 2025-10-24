import express from "express";
import grpc from "@grpc/grpc-js";
import { OrderServiceClient } from "@depot/proto-defs/order";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();
const ORDER_SERVICE_ADDRESS = process.env.ORDER_SERVICE_ADDRESS;

const orderClient = new OrderServiceClient(
  ORDER_SERVICE_ADDRESS,
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

// Get all orders for logged-in user
router.get("/", (req, res) => {
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Use camelCase for TypeScript generated client
  orderClient.listOrdersByUser(
    { userId: user_id }, // ✅ camelCase
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("List orders error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response.orders || [],
        message: "Orders fetched successfully",
      });
    }
  );
});

// Get specific order by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  orderClient.getOrder(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Get order error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      // Verify order belongs to user (response uses camelCase)
      if (response.order.userId !== user_id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: response.order,
        message: "Order fetched successfully",
      });
    }
  );
});

// Create order (typically called by payment service, but can be manual)
router.post("/create", (req, res) => {
  const { items, total, payment_id, shipping_address } = req.body;
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items are required",
    });
  }

  // Convert to camelCase for TypeScript generated client
  orderClient.createOrder(
    {
      userId: user_id, // ✅ camelCase
      items: items.map((item) => ({
        id: 0,
        orderId: 0,
        productId: item.product_id || item.productId,
        quantity: item.quantity,
        price: item.price,
        title: item.title || "",
        image: item.image || "",
      })),
      total,
      paymentId: payment_id, // ✅ camelCase
      shippingAddress: JSON.stringify(shipping_address), // ✅ camelCase
    },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Create order error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.status(201).json({
        success: true,
        data: response.order,
        message: "Order created successfully",
      });
    }
  );
});

// Update order status (admin only - add admin middleware)
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  orderClient.updateOrderStatus(
    { id: parseInt(id), status },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Update order status error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response.order,
        message: "Order status updated successfully",
      });
    }
  );
});

export default router;
