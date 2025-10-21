import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  OrderServiceService,
  CreateOrderResponse,
  GetOrderResponse,
  ListOrdersByUserResponse,
  UpdateOrderStatusResponse,
} from "../../dist/order.js";
import dotenv from "dotenv";

dotenv.config();

// Implement the order service
const orderServiceImpl = {
  // Create a new order
  createOrder: async (call, callback) => {
    try {
      // CRITICAL: Using generated TypeScript types means request uses camelCase!
      const { userId, items, total, paymentId, shippingAddress } = call.request;

      console.log("📦 Create Order Request:", {
        userId,
        itemsCount: items?.length,
        total,
        paymentId,
        shippingAddress,
      });

      if (!userId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "User ID is required",
        });
      }

      if (!items || items.length === 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Order must contain at least one item",
        });
      }

      // Create order with order items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId, // Convert camelCase to snake_case for DB
            total,
            status: "confirmed",
          },
        });

        console.log(`✅ Order created: ID=${newOrder.id}`);

        // Create order items using the existing order_items table
        // Items come in camelCase (productId) from the generated client
        const orderItems = await Promise.all(
          items.map((item) =>
            tx.order_items.create({
              data: {
                order_id: newOrder.id,
                product_id: item.productId, // camelCase from request!
                quantity: item.quantity,
                price: item.price,
              },
              include: {
                product: {
                  select: {
                    title: true,
                    image: true,
                  },
                },
              },
            })
          )
        );

        console.log(`✅ ${orderItems.length} order items created`);

        // Update product quantities
        await Promise.all(
          items.map(async (item) => {
            const product = await tx.products.findUnique({
              where: { id: item.productId }, // camelCase from request!
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            if (product.qty < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${item.quantity}`
              );
            }

            return tx.products.update({
              where: { id: item.productId }, // camelCase from request!
              data: {
                qty: {
                  decrement: item.quantity,
                },
              },
            });
          })
        );

        console.log(`✅ Product quantities updated`);

        // Clear user's cart after order creation
        const cart = await tx.carts.findUnique({
          where: { user_id: userId }, // Use camelCase userId
          include: { cart_items: true },
        });

        if (cart && cart.cart_items.length > 0) {
          await tx.cart_items.deleteMany({
            where: { cart_id: cart.id },
          });
          console.log(`✅ Cart cleared for user ${userId}`);
        }

        return {
          ...newOrder,
          order_items: orderItems.map((item) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            title: item.product.title,
            image: item.product.image,
          })),
        };
      });

      console.log(
        `🎉 Order #${order.id} created successfully for user ${userId}`
      );

      // CRITICAL FIX: Pass Date object directly - fromPartial will handle conversion
      callback(
        null,
        CreateOrderResponse.fromPartial({
          order: {
            id: order.id,
            userId: order.user_id, // Convert back to camelCase for response
            total: order.total,
            status: order.status,
            createdAt: order.created_at, // ✅ Just pass the Date object!
            orderItems: order.order_items, // camelCase for response
            paymentId: paymentId,
            shippingAddress: shippingAddress,
          },
          success: true,
          message: "Order created successfully",
        })
      );
    } catch (err) {
      console.error("❌ Create Order Error:", err);

      // Handle specific errors
      if (err.message.includes("Insufficient stock")) {
        return callback({
          code: grpc.status.FAILED_PRECONDITION,
          message: err.message,
        });
      }

      if (err.message.includes("not found")) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: err.message,
        });
      }

      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to create order",
      });
    }
  },

  // Get order by ID
  getOrder: async (call, callback) => {
    try {
      const { id } = call.request;

      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  title: true,
                  image: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Order not found",
        });
      }

      callback(
        null,
        GetOrderResponse.fromPartial({
          order: {
            id: order.id,
            userId: order.user_id, // camelCase for response
            total: order.total,
            status: order.status,
            createdAt: order.created_at, // ✅ Just pass the Date object!
            orderItems: order.order_items.map((item) => ({
              // camelCase
              id: item.id,
              orderId: item.order_id, // camelCase
              productId: item.product_id, // camelCase
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
          },
        })
      );
    } catch (err) {
      console.error("❌ Get Order Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to fetch order",
      });
    }
  },

  // List orders by user
  listOrdersByUser: async (call, callback) => {
    try {
      const { userId } = call.request; // camelCase from request

      const orders = await prisma.orders.findMany({
        where: { user_id: userId }, // Convert to snake_case for DB
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      callback(
        null,
        ListOrdersByUserResponse.fromPartial({
          orders: orders.map((order) => ({
            id: order.id,
            userId: order.user_id, // camelCase for response
            total: order.total,
            status: order.status,
            createdAt: order.created_at, // ✅ Just pass the Date object!
            orderItems: order.order_items.map((item) => ({
              // camelCase
              id: item.id,
              orderId: item.order_id, // camelCase
              productId: item.product_id, // camelCase
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
          })),
        })
      );
    } catch (err) {
      console.error("❌ List Orders Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to fetch orders",
      });
    }
  },

  // Update order status
  updateOrderStatus: async (call, callback) => {
    try {
      const { id, status } = call.request;

      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const order = await prisma.orders.update({
        where: { id },
        data: { status },
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      callback(
        null,
        UpdateOrderStatusResponse.fromPartial({
          order: {
            id: order.id,
            userId: order.user_id, // camelCase for response
            total: order.total,
            status: order.status,
            createdAt: order.created_at, // ✅ Just pass the Date object!
            orderItems: order.order_items.map((item) => ({
              // camelCase
              id: item.id,
              orderId: item.order_id, // camelCase
              productId: item.product_id, // camelCase
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
          },
          success: true,
          message: "Order status updated successfully",
        })
      );
    } catch (err) {
      console.error("❌ Update Order Status Error:", err);

      if (err.code === "P2025") {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Order not found",
        });
      }

      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to update order status",
      });
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(OrderServiceService, orderServiceImpl);

  const PORT = process.env.ORDER_SERVICE_PORT || 50053;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start server:", err);
        throw err;
      }
      console.log(`🟢 OrderService running on port ${port}`);
    }
  );
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Order Service...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down Order Service...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
