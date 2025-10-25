import express from "express";
import { ProductServiceClient } from "@depot/proto-defs/product";
import {
  grpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const productClient = grpcClientManager.getClient(
  "PRODUCT_SERVICE",
  ProductServiceClient
);

// List all products
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  productClient.listProducts(
    { limit, offset },
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { products: response.products || [] },
          "Products fetched successfully"
        );
      },
      "Failed to fetch products"
    )
  );
});

// Get product by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return ResponseFormatter.validationError(res, { id: "Invalid product ID" });
  }

  productClient.getProduct(
    { id },
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        if (!response?.product) {
          return ResponseFormatter.notFound(res, "Product not found");
        }

        ResponseFormatter.success(
          res,
          { product: response.product },
          "Product fetched successfully"
        );
      },
      "Failed to fetch product"
    )
  );
});

export default router;
