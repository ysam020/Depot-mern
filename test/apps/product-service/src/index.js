import { ProductServiceService } from "@depot/proto-defs/product";
import { BaseGrpcService } from "@depot/grpc-utils";
import ProductController from "./controllers/index.js";

const productController = new ProductController();

class ProductService {
  static async getProduct(call, callback) {
    await productController.getProduct(call, callback);
  }

  static async listProducts(call, callback) {
    await productController.listProducts(call, callback);
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
