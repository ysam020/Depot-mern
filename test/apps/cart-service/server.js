import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { getUserIdFromMetadata } from "@depot/grpc-utils";
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

class CartService {
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
    await BaseGrpcService.asyncHandler(callback, async () => {
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

      callback(
        null,
        BaseGrpcService.successResponse(AddToCartResponse, {
          cart: CartService.mapCartItem(cartItem),
        })
      );
    });
  }

  static async updateCart(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
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

      callback(
        null,
        BaseGrpcService.successResponse(UpdateCartResponse, { carts })
      );
    });
  }

  static async deleteCart(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
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

      callback(
        null,
        BaseGrpcService.successResponse(DeleteCartResponse, { cart: null })
      );
    });
  }

  static async getCart(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

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

      callback(
        null,
        BaseGrpcService.successResponse(GetCartResponse, { carts })
      );
    });
  }

  static async clearCart(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
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

      callback(
        null,
        BaseGrpcService.successResponse(GetCartResponse, { carts: [] })
      );
    });
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
