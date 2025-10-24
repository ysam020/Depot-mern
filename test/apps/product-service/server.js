import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { successResponse, errorResponse } from "@depot/grpc-utils";
import {
  ProductServiceService,
  GetProductResponse,
  ListProductsResponse,
} from "@depot/proto-defs/product";
import { BaseGrpcService } from "@depot/grpc-utils";

class ProductService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      getProduct: BaseGrpcService.wrapHandler(ProductService.getProduct),
      listProducts: BaseGrpcService.wrapHandler(ProductService.listProducts),
    };

    super("ProductService", ProductServiceService, serviceImpl, {
      port: process.env.PRODUCT_SERVICE_PORT,
    });
  }

  static async getProduct(call, callback) {
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

    const response = successResponse(
      { product },
      "Product fetched successfully"
    );
    callback(null, GetProductResponse.fromPartial(response.data));
  }

  static async listProducts(call, callback) {
    const products = await prisma.products.findMany();

    const response = successResponse(
      { products },
      "Products fetched successfully"
    );
    callback(null, ListProductsResponse.fromPartial(response.data));
  }
}

// Start the server
const productService = new ProductService();
productService.start().catch((err) => {
  console.error("Failed to start ProductService:", err);
  process.exit(1);
});
