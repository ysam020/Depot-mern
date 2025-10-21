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
        // Create the order with shipping address
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId,
            total,
            status: "confirmed",
            shipping_address: shippingAddress, // ✅ Save shipping address as JSON string
          },
        });

        console.log(
          `✅ Order created: ID=${newOrder.id}, Shipping saved: ${!!shippingAddress}`
        );

        // Create order items using the existing order_items table
        const orderItems = await Promise.all(
          items.map((item) =>
            tx.order_items.create({
              data: {
                order_id: newOrder.id,
                product_id: item.productId,
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
              where: { id: item.productId },
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            if (product.qty < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${item.quantity}`
              );
            }

            await tx.products.update({
              where: { id: item.productId },
              data: { qty: product.qty - item.quantity },
            });

            console.log(
              `✅ Updated product ${item.productId} qty: ${product.qty} -> ${product.qty - item.quantity}`
            );
          })
        );

        // If paymentId is provided, link the payment to this order
        if (paymentId) {
          await tx.payments.update({
            where: { id: paymentId },
            data: { order_id: newOrder.id },
          });
          console.log(`✅ Linked payment ${paymentId} to order ${newOrder.id}`);
        }

        return {
          ...newOrder,
          order_items: orderItems,
        };
      });

      callback(
        null,
        CreateOrderResponse.fromPartial({
          order: {
            id: order.id,
            userId: order.user_id,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            orderItems: order.order_items.map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
            paymentId: paymentId || 0,
            shippingAddress: order.shipping_address || "", // ✅ Include shipping address in response
          },
          success: true,
          message: "Order created successfully",
        })
      );
    } catch (err) {
      console.error("❌ Create Order Error:", err);
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
            userId: order.user_id,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            orderItems: order.order_items.map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
            paymentId: 0,
            shippingAddress: order.shipping_address || "", // ✅ Include shipping address
          },
        })
      );
    } catch (err) {
      console.error("❌ Get Order Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to get order",
      });
    }
  },

  // List orders by user
  listOrdersByUser: async (call, callback) => {
    try {
      const { userId } = call.request;

      const orders = await prisma.orders.findMany({
        where: { user_id: userId },
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
        orderBy: { created_at: "desc" },
      });

      callback(
        null,
        ListOrdersByUserResponse.fromPartial({
          orders: orders.map((order) => ({
            id: order.id,
            userId: order.user_id,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            orderItems: order.order_items.map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
            paymentId: 0,
            shippingAddress: order.shipping_address || "", // ✅ Include shipping address
          })),
        })
      );
    } catch (err) {
      console.error("❌ List Orders Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to list orders",
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
            userId: order.user_id,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            orderItems: order.order_items.map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
            paymentId: 0,
            shippingAddress: order.shipping_address || "", // ✅ Include shipping address
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
