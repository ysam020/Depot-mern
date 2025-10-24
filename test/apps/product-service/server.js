import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import prisma from "@depot/prisma";
import { successResponse, BaseGrpcService } from "@depot/grpc-utils";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load proto
const PRODUCT_PROTO_PATH = path.resolve(
  __dirname,
  "../../packages/proto-defs/src/proto/product.proto"
);

const packageDef = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDef);

class ProductService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      GetProduct: BaseGrpcService.wrapHandler(ProductService.getProduct),
      ListProducts: BaseGrpcService.wrapHandler(ProductService.listProducts),
    };

    super(
      "ProductService",
      productProto.products.ProductService.service,
      serviceImpl,
      { port: process.env.PRODUCT_SERVICE_PORT || 50052 }
    );
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
    callback(null, response.data);
  }

  static async listProducts(call, callback) {
    const products = await prisma.products.findMany();
    const response = successResponse(
      { products },
      "Products fetched successfully"
    );
    callback(null, response.data);
  }
}

new ProductService().start().catch((err) => {
  console.error("Failed to start ProductService:", err);
  process.exit(1);
});
