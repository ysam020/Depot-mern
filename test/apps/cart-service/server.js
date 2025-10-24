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
} from "../../dist/cart.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

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

      const response = successResponse(
        { cart: mapCartItem(cartItem) },
        "Product added to cart successfully"
      );
      callback(null, AddToCartResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ AddToCart Error:", err);
      const response = errorResponse(err.message || "Failed to add to cart");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  updateCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId, quantity } = call.request;

      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (!cart) {
        const response = errorResponse("Cart not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
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
    } catch (err) {
      console.error("❌ UpdateCart Error:", err);
      const response = errorResponse(err.message || "Failed to update cart");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  deleteCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id: productId } = call.request;

      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (!cart) {
        const response = errorResponse("Cart not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id, product_id: productId },
      });

      const response = successResponse(
        {},
        "Product removed from cart successfully"
      );
      callback(null, DeleteCartResponse.fromPartial({ cart: null }));
    } catch (err) {
      console.error("❌ DeleteCart Error:", err);
      const response = errorResponse(
        err.message || "Failed to delete from cart"
      );
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  getCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User ID missing");
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: response.message,
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

      const response = successResponse({ carts }, "Cart fetched successfully");
      callback(null, GetCartResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ GetCart Error:", err);
      const response = errorResponse(err.message || "Failed to fetch cart");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  clearCart: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User ID missing");
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: response.message,
        });
      }

      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (!cart) {
        const response = errorResponse("Cart not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      // Delete all cart items for this user
      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id },
      });

      console.log(`✅ Cart cleared for user ${userId}`);

      const response = successResponse({}, "Cart cleared successfully");
      callback(null, GetCartResponse.fromPartial({ carts: [] }));
    } catch (err) {
      console.error("❌ ClearCart Error:", err);
      const response = errorResponse(err.message || "Failed to clear cart");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
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
