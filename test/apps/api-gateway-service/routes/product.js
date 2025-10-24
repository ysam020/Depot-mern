import express from "express";
import { ProductServiceClient } from "../../../dist/product.js";
import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const PRODUCT_SERVICE_ADDRESS = process.env.PRODUCT_SERVICE_ADDRESS;

const productClient = new ProductServiceClient(
  PRODUCT_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

const router = express.Router();

// List all products
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  productClient.listProducts({ limit, offset }, (err, response) => {
    if (err) {
      console.error("gRPC Error (listProducts):", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: response.products || [],
      message: "Products fetched successfully",
    });
  });
});

// Get product by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  productClient.getProduct({ id }, (err, response) => {
    if (err) {
      console.error("gRPC Error (getProduct):", err);

      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    if (!response?.product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: response.product,
      message: "Product fetched successfully",
    });
  });
});

export default router;
