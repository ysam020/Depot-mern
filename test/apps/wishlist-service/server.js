import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { getUserIdFromMetadata } from "@depot/grpc-utils";
import {
  WishlistServiceService,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  GetWishlistResponse,
  Wishlist as WishlistMessage,
} from "../../dist/wishlist.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to convert Prisma wishlist item to gRPC Wishlist message
const mapWishlistItem = (wishlistItem) => {
  return WishlistMessage.fromPartial({
    id: wishlistItem.product.id,
    title: wishlistItem.product.title,
    price: Math.floor(wishlistItem.product.price),
    image: wishlistItem.product.image,
    quantity: 1, // Wishlists typically don't have quantities, defaulting to 1
  });
};

const wishlistServiceImpl = {
  addToWishlist: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      if (!userId) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "User not authenticated",
        });
      }

      // Check if product already in wishlist
      const existingItem = await prisma.wishlists.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (existingItem) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: "Product already in wishlist",
        });
      }

      // Add product to wishlist
      await prisma.wishlists.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
      });

      // Fetch updated wishlist
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) => mapWishlistItem(item));

      callback(
        null,
        AddToWishlistResponse.fromPartial({ wishlist: wishlists })
      );
    } catch (err) {
      console.error("AddToWishlist error:", err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  removeFromWishlist: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      if (!userId) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "User not authenticated",
        });
      }

      // Check if wishlist item exists
      const wishlistItem = await prisma.wishlists.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (!wishlistItem) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found in wishlist",
        });
      }

      // Remove product from wishlist
      await prisma.wishlists.deleteMany({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      // Fetch updated wishlist
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) => mapWishlistItem(item));

      callback(
        null,
        RemoveFromWishlistResponse.fromPartial({ wishlist: wishlists })
      );
    } catch (err) {
      console.error("RemoveFromWishlist error:", err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  getWishlist: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "User not authenticated",
        });
      }

      // Fetch all wishlist items for the user
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) => mapWishlistItem(item));

      callback(null, GetWishlistResponse.fromPartial({ wishlist: wishlists }));
    } catch (err) {
      console.error("GetWishlist error:", err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(WishlistServiceService, wishlistServiceImpl);

  const PORT = process.env.WISHLIST_SERVICE_PORT || 50054;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) throw err;
      console.log(`🟢 WishlistService running on port ${port}`);
    }
  );
}

startServer();
