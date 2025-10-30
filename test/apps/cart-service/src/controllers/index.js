import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import { Cart as CartMessage } from "@depot/proto-defs/cart";
import { addToCartHandler } from "../handlers/addToCart.handler.js";
import { updateCartHandler } from "../handlers/updateCart.handler.js";
import { deleteCartHandler } from "../handlers/deleteCart.handler.js";
import { getCartHandler } from "../handlers/getCart.handler.js";
import { clearCartHandler } from "../handlers/clearCart.handler.js";

class CartController extends BaseServiceController {
  constructor() {
    super(prisma.carts, process.env.JWT_SECRET); // Pass JWT secret
    this.cartItemsModel = prisma.cart_items;
    this.CartMessage = CartMessage;
    this.grpc = grpc;
  }

  async getOrCreateCart(userId) {
    return await this.getOrCreate(userId);
  }

  async findUserCart(userId) {
    return await this.findOne({ user_id: userId });
  }

  async getCartWithItems(userId) {
    return await this.findOne(
      { user_id: userId },
      {
        include: { cart_items: { include: { product: true } } },
      }
    );
  }

  async findCartItem(cartId, productId) {
    return await this.cartItemsModel.findFirst({
      where: { cart_id: cartId, product_id: productId },
    });
  }

  async createCartItem(cartId, productId, quantity) {
    return await this.cartItemsModel.create({
      data: {
        cart_id: cartId,
        product_id: productId,
        quantity,
      },
      include: { product: true },
    });
  }

  async updateCartItem(cartItemId, quantity) {
    return await this.cartItemsModel.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  }

  async updateCartItemQuantity(cartId, productId, quantity) {
    return await this.cartItemsModel.updateMany({
      where: { cart_id: cartId, product_id: productId },
      data: { quantity },
    });
  }

  async removeCartItem(cartId, productId) {
    return await this.cartItemsModel.deleteMany({
      where: { cart_id: cartId, product_id: productId },
    });
  }

  async clearCartItems(cartId) {
    return await this.cartItemsModel.deleteMany({
      where: { cart_id: cartId },
    });
  }

  async clearUserCart(userId) {
    const cart = await this.findUserCart(userId);
    if (cart) {
      await this.clearCartItems(cart.id);
    }
  }

  async addToCart(call, callback) {
    await addToCartHandler(this, call, callback);
  }

  async updateCart(call, callback) {
    await updateCartHandler(this, call, callback);
  }

  async deleteCart(call, callback) {
    await deleteCartHandler(this, call, callback);
  }

  async getCart(call, callback) {
    await getCartHandler(this, call, callback);
  }

  async clearCart(call, callback) {
    await clearCartHandler(this, call, callback);
  }
}

export default CartController;
