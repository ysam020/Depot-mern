import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { successResponse, errorResponse } from "@depot/grpc-utils";
import {
  ProductServiceService,
  GetProductResponse,
  ListProductsResponse,
} from "../../dist/product.js";

// Implement the service using Prisma
const productServiceImpl = {
  getProduct: async (call, callback) => {
    try {
      const product = await prisma.products.findUnique({
        where: { id: call.request.id },
      });

      if (!product) {
        const response = errorResponse("Product not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      const response = successResponse(
        { product },
        "Product fetched successfully"
      );
      callback(null, GetProductResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ GetProduct Error:", err);
      const response = errorResponse(err.message || "Failed to fetch product");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  listProducts: async (call, callback) => {
    try {
      const products = await prisma.products.findMany();

      const response = successResponse(
        { products },
        "Products fetched successfully"
      );
      callback(null, ListProductsResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ ListProducts Error:", err);
      const response = errorResponse(err.message || "Failed to fetch products");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(ProductServiceService, productServiceImpl);

  const PORT = process.env.PRODUCT_SERVICE_PORT;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) throw err;
      console.log(`🟢 ProductService running on port ${port}`);
    }
  );
}

startServer();
