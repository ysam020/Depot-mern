import express from "express";
import grpc from "@grpc/grpc-js";
import { CartServiceClient } from "../../../dist/cart.js";
import dotenv from "dotenv";
dotenv.config();

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
  const { id, quantity } = req.body;
  cartClient.addToCart(
    { id, quantity },
    createMetadata(req),
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.cart);
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
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.cart);
    }
  );
});

// Delete cart
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  cartClient.deleteCart(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.cart);
    }
  );
});

// Get all cart items
router.get("/", (req, res) => {
  const id = req.user.id;
  cartClient.getCart(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.carts);
    }
  );
});

export default router;
