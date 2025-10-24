import express from "express";
import grpc from "@grpc/grpc-js";
import { CartServiceClient } from "@depot/proto-defs/cart";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const router = express.Router();
const CART_SERVICE_ADDRESS = process.env.CART_SERVICE_ADDRESS;

const cartClient = new CartServiceClient(
  CART_SERVICE_ADDRESS,
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

// Add to cart
router.post("/", (req, res) => {
  const { id, quantity = 1 } = req.body;
  cartClient.addToCart(
    { id, quantity },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Add to cart error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response.cart,
        message: "Product added to cart",
      });
    }
  );
});

// Update cart
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  cartClient.updateCart(
    { id: parseInt(id), quantity },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Update cart error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response.cart,
        message: "Cart updated successfully",
      });
    }
  );
});

// Delete from cart
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  cartClient.deleteCart(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Delete from cart error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      res.json({
        success: true,
        data: response.cart,
        message: "Product removed from cart",
      });
    }
  );
});

// Get all cart items
router.get("/", (req, res) => {
  cartClient.getCart(
    {}, // Empty request object since GetCartRequest is empty
    createMetadata(req), // JWT is passed in metadata
    (err, response) => {
      if (err) {
        console.error("Get cart error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      // response.carts is the array from proto
      res.json({
        success: true,
        data: response.carts || [],
        message: "Cart fetched successfully",
      });
    }
  );
});

export default router;
