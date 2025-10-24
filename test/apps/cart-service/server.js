import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  getUserIdFromMetadata,
  successResponse,
  errorResponse,
} from "@depot/grpc-utils";
import {
  CartServiceService,
  AddToCartResponse,
  UpdateCartResponse,
  DeleteCartResponse,
  GetCartResponse,
  Cart as CartMessage,
} from "@depot/proto-defs/cart";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

class CartService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      addToCart: BaseGrpcService.wrapHandler(CartService.addToCart),
      updateCart: BaseGrpcService.wrapHandler(CartService.updateCart),
      deleteCart: BaseGrpcService.wrapHandler(CartService.deleteCart),
      getCart: BaseGrpcService.wrapHandler(CartService.getCart),
      clearCart: BaseGrpcService.wrapHandler(CartService.clearCart),
    };

    super("CartService", CartServiceService, serviceImpl, {
      port: process.env.CART_SERVICE_PORT,
    });
  }

  static mapCartItem(cartItem) {
    return CartMessage.fromPartial({
      id: cartItem.product.id,
      title: cartItem.product.title,
      price: Math.floor(cartItem.product.price),
      image: cartItem.product.image,
      quantity: cartItem.quantity,
    });
  }

  static async getOrCreateCart(userId) {
    let cart = await prisma.carts.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = await prisma.carts.create({ data: { user_id: userId } });
    }

    return cart;
  }

  static async addToCart(call, callback) {
    const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
    const { id: productId, quantity = 1 } = call.request;

    const cart = await CartService.getOrCreateCart(userId);

    const existingItem = await prisma.cart_items.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_id: productId,
          quantity,
        },
        include: { product: true },
      });
    }

    const response = successResponse(
      { cart: CartService.mapCartItem(cartItem) },
      "Product added to cart successfully"
    );
    callback(null, AddToCartResponse.fromPartial(response.data));
  }

  static async updateCart(call, callback) {
    const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
    const { id: productId, quantity } = call.request;

    const cart = await prisma.carts.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    await prisma.cart_items.updateMany({
      where: { cart_id: cart.id, product_id: productId },
      data: { quantity },
    });

    const updatedCart = await prisma.carts.findUnique({
      where: { user_id: userId },
      include: { cart_items: { include: { product: true } } },
    });

    const carts =
      updatedCart?.cart_items.map((item) =>
        CartMessage.fromPartial({
          id: item.product.id,
          title: item.product.title,
          price: Math.floor(item.product.price),
          image: item.product.image,
          quantity: item.quantity,
        })
      ) || [];

    const response = successResponse({ carts }, "Cart updated successfully");
    callback(null, UpdateCartResponse.fromPartial(response.data));
  }

  static async deleteCart(call, callback) {
    const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
    const { id: productId } = call.request;

    const cart = await prisma.carts.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    await prisma.cart_items.deleteMany({
      where: { cart_id: cart.id, product_id: productId },
    });

    const response = successResponse(
      {},
      "Product removed from cart successfully"
    );
    callback(null, DeleteCartResponse.fromPartial({ cart: null }));
  }

  static async getCart(call, callback) {
    const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

    if (!userId) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "User ID missing"
      );
    }

    const cart = await prisma.carts.findUnique({
      where: { user_id: userId },
      include: { cart_items: { include: { product: true } } },
    });

    const carts =
      cart?.cart_items.map((item) =>
        CartMessage.fromPartial({
          id: item.product.id,
          title: item.product.title,
          price: Math.floor(item.product.price),
          image: item.product.image,
          quantity: item.quantity,
        })
      ) || [];

    const response = successResponse({ carts }, "Cart fetched successfully");
    callback(null, GetCartResponse.fromPartial(response.data));
  }

  static async clearCart(call, callback) {
    const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

    if (!userId) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "User ID missing"
      );
    }

    const cart = await prisma.carts.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    // Delete all cart items for this user
    await prisma.cart_items.deleteMany({
      where: { cart_id: cart.id },
    });

    const response = successResponse({}, "Cart cleared successfully");
    callback(null, GetCartResponse.fromPartial({ carts: [] }));
  }
}

// Start the server
const cartService = new CartService();
cartService.start().catch((err) => {
  console.error("Failed to start CartService:", err);
  process.exit(1);
});
