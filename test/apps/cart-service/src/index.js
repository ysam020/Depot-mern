import { CartServiceService } from "@depot/proto-defs/cart";
import { BaseGrpcService } from "@depot/grpc-utils";
import CartController from "./controllers/index.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const cartController = new CartController();

class CartService {
  static async addToCart(call, callback) {
    await cartController.addToCart(call, callback);
  }

  static async updateCart(call, callback) {
    await cartController.updateCart(call, callback);
  }

  static async deleteCart(call, callback) {
    await cartController.deleteCart(call, callback);
  }

  static async getCart(call, callback) {
    await cartController.getCart(call, callback);
  }

  static async clearCart(call, callback) {
    await cartController.clearCart(call, callback);
  }
}

const cartService = BaseGrpcService.createService(
  "CartService",
  CartServiceService,
  CartService,
  { port: process.env.CART_SERVICE_PORT }
);

// Start the server
cartService.start().catch((err) => {
  console.error("Failed to start CartService:", err);
  process.exit(1);
});
