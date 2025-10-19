import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma"; // your Prisma client
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
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, GetProductResponse.fromPartial({ product }));
    } catch (err) {
      console.error("gRPC Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  listProducts: async (call, callback) => {
    try {
      const products = await prisma.products.findMany();

      callback(null, ListProductsResponse.fromPartial({ products }));
    } catch (err) {
      console.error("gRPC Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
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
