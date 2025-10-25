import express from "express";
import { CartServiceClient } from "@depot/proto-defs/cart";
import {
  grpcClientManager,
  GrpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const cartClient = grpcClientManager.getClient(
  "CART_SERVICE",
  CartServiceClient
);

// Add to cart
router.post("/", (req, res) => {
  const { id, quantity = 1 } = req.body;

  if (!id) {
    return ResponseFormatter.validationError(res, {
      id: "Product ID is required",
    });
  }

  cartClient.addToCart(
    { id, quantity },
    GrpcClientManager.createMetadata(req), // Static method
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { cart: response.cart },
          "Product added to cart"
        );
      },
      "Failed to add product to cart"
    )
  );
});

// Update cart
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return ResponseFormatter.validationError(res, {
      quantity: "Quantity is required",
    });
  }

  cartClient.updateCart(
    { id: parseInt(id), quantity },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { carts: response.carts },
          "Cart updated successfully"
        );
      },
      "Failed to update cart"
    )
  );
});

// Delete from cart
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  cartClient.deleteCart(
    { id: parseInt(id) },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { cart: response.cart },
          "Product removed from cart"
        );
      },
      "Failed to remove product from cart"
    )
  );
});

// Get cart
router.get("/", (req, res) => {
  cartClient.getCart(
    {},
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { carts: response.carts || [] },
          "Cart fetched successfully"
        );
      },
      "Failed to fetch cart"
    )
  );
});

export default router;
