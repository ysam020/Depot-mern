import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  getUserIdFromMetadata,
  successResponse,
  errorResponse,
} from "@depot/grpc-utils";
import {
  WishlistServiceService,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  GetWishlistResponse,
  Wishlist as WishlistMessage,
} from "../../dist/wishlist.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

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
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
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
        const response = errorResponse("Product already in wishlist");
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: response.message,
        });
      }

      // Add product to wishlist
      const wishlistItem = await prisma.wishlists.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
        include: { product: true },
      });

      const response = successResponse(
        { wishlist: [mapWishlistItem(wishlistItem)] },
        "Product added to wishlist successfully"
      );
      callback(null, AddToWishlistResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ AddToWishlist Error:", err);
      const response = errorResponse(
        err.message || "Failed to add to wishlist"
      );
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  removeFromWishlist: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

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

      const wishlists = userWishlists.map((item) => mapWishlistItem(item));

      const response = successResponse(
        { wishlist: wishlists },
        "Product removed from wishlist successfully"
      );
      callback(null, RemoveFromWishlistResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ RemoveFromWishlist Error:", err);
      const response = errorResponse(
        err.message || "Failed to remove from wishlist"
      );
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  getWishlist: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

      // Fetch all wishlist items for the user
      const userWishlists = await prisma.wishlists.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      const wishlists = userWishlists.map((item) => mapWishlistItem(item));

      const response = successResponse(
        { wishlist: wishlists },
        "Wishlist fetched successfully"
      );
      callback(null, GetWishlistResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ GetWishlist Error:", err);
      const response = errorResponse(err.message || "Failed to fetch wishlist");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
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
