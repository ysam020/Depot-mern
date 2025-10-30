import { WishlistServiceService } from "@depot/proto-defs/wishlist";
import { BaseGrpcService } from "@depot/grpc-utils";
import WishlistController from "./controllers/index.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const wishlistController = new WishlistController();

class WishlistService {
  static async addToWishlist(call, callback) {
    await wishlistController.addToWishlist(call, callback);
  }

  static async removeFromWishlist(call, callback) {
    await wishlistController.removeFromWishlist(call, callback);
  }

  static async getWishlist(call, callback) {
    await wishlistController.getWishlist(call, callback);
  }
}

const wishlistService = BaseGrpcService.createService(
  "WishlistService",
  WishlistServiceService,
  WishlistService,
  { port: process.env.WISHLIST_SERVICE_PORT || 50055 }
);

// Start the server
wishlistService.start().catch((err) => {
  console.error("Failed to start WishlistService:", err);
  process.exit(1);
});
