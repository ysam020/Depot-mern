import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { getUserIdFromMetadata } from "@depot/grpc-utils";
import {
  WishlistServiceService,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  GetWishlistResponse,
  Wishlist as WishlistMessage,
} from "@depot/proto-defs/wishlist";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

class WishlistService {
  static mapWishlistItem(wishlistItem) {
    return WishlistMessage.fromPartial({
      id: wishlistItem.product.id,
      title: wishlistItem.product.title,
      price: Math.floor(wishlistItem.product.price),
      image: wishlistItem.product.image,
      quantity: 1,
    });
  }

  static async addToWishlist(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      // Check if product already in wishlist
      const existingItem = await prisma.wishlists.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (existingItem) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.ALREADY_EXISTS,
          "Product already in wishlist"
        );
      }

      // Add product to wishlist
      const wishlistItem = await prisma.wishlists.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
        include: { product: true },
      });

      // Cleaner response creation
      callback(
        null,
        BaseGrpcService.successResponse(AddToWishlistResponse, {
          wishlist: [WishlistService.mapWishlistItem(wishlistItem)],
        })
      );
    });
  }

  static async removeFromWishlist(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      // Remove from wishlist
      await prisma.wishlists.deleteMany({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      // Fetch remaining wishlist items
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) =>
        WishlistService.mapWishlistItem(item)
      );

      // Cleaner response creation
      callback(
        null,
        BaseGrpcService.successResponse(RemoveFromWishlistResponse, {
          wishlist: wishlists,
        })
      );
    });
  }

  static async getWishlist(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      // Fetch all wishlist items for the user
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) =>
        WishlistService.mapWishlistItem(item)
      );

      callback(
        null,
        BaseGrpcService.successResponse(GetWishlistResponse, {
          wishlist: wishlists,
        })
      );
    });
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
