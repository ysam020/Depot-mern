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
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

class WishlistService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      addToWishlist: BaseGrpcService.wrapHandler(WishlistService.addToWishlist),
      removeFromWishlist: BaseGrpcService.wrapHandler(
        WishlistService.removeFromWishlist
      ),
      getWishlist: BaseGrpcService.wrapHandler(WishlistService.getWishlist),
    };

    super("WishlistService", WishlistServiceService, serviceImpl, {
      port: process.env.WISHLIST_SERVICE_PORT || 50055,
    });
  }

  static getUserId(metadata) {
    const userId = getUserIdFromMetadata(metadata, JWT_SECRET);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return userId;
  }

  static mapWishlistItem(wishlistItem) {
    return WishlistMessage.fromPartial({
      id: wishlistItem.product.id,
      title: wishlistItem.product.title,
      price: Math.floor(wishlistItem.product.price),
      image: wishlistItem.product.image,
      quantity: 1, // Wishlists typically don't have quantities, defaulting to 1
    });
  }

  static async addToWishlist(call, callback) {
    const userId = WishlistService.getUserId(call.metadata);
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

    const response = successResponse(
      { wishlist: [WishlistService.mapWishlistItem(wishlistItem)] },
      "Product added to wishlist successfully"
    );
    callback(null, AddToWishlistResponse.fromPartial(response.data));
  }

  static async removeFromWishlist(call, callback) {
    const userId = WishlistService.getUserId(call.metadata);
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

    const response = successResponse(
      { wishlist: wishlists },
      "Product removed from wishlist successfully"
    );
    callback(null, RemoveFromWishlistResponse.fromPartial(response.data));
  }

  static async getWishlist(call, callback) {
    const userId = WishlistService.getUserId(call.metadata);

    // Fetch all wishlist items for the user
    const userWishlists = await prisma.wishlists.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    const wishlists = userWishlists.map((item) =>
      WishlistService.mapWishlistItem(item)
    );

    const response = successResponse(
      { wishlist: wishlists },
      "Wishlist fetched successfully"
    );
    callback(null, GetWishlistResponse.fromPartial(response.data));
  }
}

// Start the server
const wishlistService = new WishlistService();
wishlistService.start().catch((err) => {
  console.error("Failed to start WishlistService:", err);
  process.exit(1);
});
