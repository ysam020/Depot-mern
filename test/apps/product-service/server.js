import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  ProductServiceService,
  GetProductResponse,
  ListProductsResponse,
} from "@depot/proto-defs/product";
import { BaseGrpcService } from "@depot/grpc-utils";

class ProductService {
  static async getProduct(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const { id } = call.request;

      const product = await prisma.products.findUnique({
        where: { id },
      });

      if (!product) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.NOT_FOUND,
          "Product not found"
        );
      }

      callback(
        null,
        BaseGrpcService.successResponse(GetProductResponse, { product })
      );
    });
  }

  static async listProducts(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const products = await prisma.products.findMany();

      callback(
        null,
        BaseGrpcService.successResponse(ListProductsResponse, { products })
      );
    });
  }
}

const productService = BaseGrpcService.createService(
  "ProductService",
  ProductServiceService,
  ProductService,
  { port: process.env.PRODUCT_SERVICE_PORT }
);

// Start the server
productService.start().catch((err) => {
  console.error("Failed to start ProductService:", err);
  process.exit(1);
});
