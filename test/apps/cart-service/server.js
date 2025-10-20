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
} from "../../dist/cart.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to convert Prisma cart item to gRPC Cart message
const mapCartItem = (cartItem) => {
  return CartMessage.fromPartial({
    id: cartItem.product.id,
    title: cartItem.product.title,
    price: Math.floor(cartItem.product.price),
    image: cartItem.product.image,
    quantity: cartItem.quantity,
  });
};

const cartServiceImpl = {
  addToCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId, quantity = 1 } = call.request;

      let cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (!cart) {
        cart = await prisma.carts.create({ data: { user_id: userId } });
      }

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
        AddToCartResponse.fromPartial({ cart: mapCartItem(cartItem) })
      );
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  updateCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId, quantity } = call.request;

      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });
      if (!cart) throw new Error("Cart not found");

      await prisma.cart_items.updateMany({
        where: { cart_id: cart.id, product_id: productId },
        data: { quantity },
      });

      await prisma.cart_items.findFirst({
        where: { cart_id: cart.id, product_id: productId },
        include: { product: true },
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

      callback(null, UpdateCartResponse.fromPartial({ carts }));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  deleteCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });
      if (!cart) throw new Error("Cart not found");

      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id, product_id: productId },
      });

      callback(null, DeleteCartResponse.fromPartial({ cart: null }));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  getCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "User ID missing",
        });
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

      callback(null, GetCartResponse.fromPartial({ carts }));
    } catch (err) {
      console.error(err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(CartServiceService, cartServiceImpl);

  const PORT = process.env.CART_SERVICE_PORT || 50053;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) throw err;
      console.log(`🟢 CartService running on port ${port}`);
    }
  );
}

startServer();
