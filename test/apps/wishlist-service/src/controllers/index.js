import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import { Wishlist as WishlistMessage } from "@depot/proto-defs/wishlist";
import { addToWishlistHandler } from "../handlers/addToWishlist.handler.js";
import { removeFromWishlistHandler } from "../handlers/removeFromWishlist.handler.js";
import { getWishlistHandler } from "../handlers/getWishlist.handler.js";

class WishlistController extends BaseServiceController {
  constructor() {
    super(prisma.wishlists, process.env.JWT_SECRET);
    this.WishlistMessage = WishlistMessage;
  }

  async findUserWishlist(userId) {
    return await this.findMany({
      where: { user_id: userId },
      include: { product: true },
    });
  }

  async isInWishlist(userId, productId) {
    return await this.exists({ user_id: userId, product_id: productId });
  }

  async addProduct(userId, productId) {
    return await this.create(
      { user_id: userId, product_id: productId },
      { include: { product: true } }
    );
  }

  async removeProduct(userId, productId) {
    return await this.delete({ user_id: userId, product_id: productId });
  }

  async clearWishlist(userId) {
    return await this.delete({ user_id: userId });
  }

  async countWishlistItems(userId) {
    return await this.count({ user_id: userId });
  }

  async findUserWishlistWithPagination(userId, limit = 20, offset = 0) {
    return await this.findWithPagination({ user_id: userId }, limit, offset, {
      include: { product: true },
      orderBy: { created_at: "desc" },
    });
  }

  async moveToCart(userId, productIds) {
    for (const productId of productIds) {
      await this.removeProduct(userId, productId);
    }
  }

  async addToWishlist(call, callback) {
    await addToWishlistHandler(this, call, callback);
  }

  async removeFromWishlist(call, callback) {
    await removeFromWishlistHandler(this, call, callback);
  }

  async getWishlist(call, callback) {
    await getWishlistHandler(this, call, callback);
  }
}

export default WishlistController;
