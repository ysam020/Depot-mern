import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  getUserIdFromMetadata,
  successResponse,
  errorResponse,
} from "@depot/grpc-utils";
import {
  OrderServiceService,
  CreateOrderResponse,
  GetOrderResponse,
  ListOrdersByUserResponse,
  UpdateOrderStatusResponse,
} from "../../dist/order.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Implement the order service
const orderServiceImpl = {
  // Create a new order
  createOrder: async (call, callback) => {
    try {
      // Get userId from JWT metadata
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

      // CRITICAL: Using generated TypeScript types means request uses camelCase!
      const { items, total, paymentId, shippingAddress } = call.request;

      console.log("📦 Create Order Request:", {
        userId,
        itemsCount: items?.length,
        total,
        paymentId,
        shippingAddress,
      });

      if (!items || items.length === 0) {
        const response = errorResponse("Order must contain at least one item");
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: response.message,
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
            shipping_address: shippingAddress,
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

      const response = successResponse(
        {
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
            shippingAddress: order.shipping_address || "",
          },
        },
        "Order created successfully"
      );

      callback(
        null,
        CreateOrderResponse.fromPartial({
          ...response.data,
          success: response.success,
          message: response.message,
        })
      );
    } catch (err) {
      console.error("❌ Create Order Error:", err);
      const response = errorResponse(err.message || "Failed to create order");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  // Get order by ID
  getOrder: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

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
        const response = errorResponse("Order not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      // Verify order belongs to the authenticated user
      if (order.user_id !== userId) {
        const response = errorResponse("Access denied");
        return callback({
          code: grpc.status.PERMISSION_DENIED,
          message: response.message,
        });
      }

      const response = successResponse(
        {
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
            shippingAddress: order.shipping_address || "",
          },
        },
        "Order fetched successfully"
      );

      callback(null, GetOrderResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ Get Order Error:", err);
      const response = errorResponse(err.message || "Failed to get order");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  // List orders by user
  listOrdersByUser: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

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

      const response = successResponse(
        {
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
            shippingAddress: order.shipping_address || "",
          })),
        },
        "Orders fetched successfully"
      );

      callback(null, ListOrdersByUserResponse.fromPartial(response.data));
    } catch (err) {
      console.error("❌ List Orders Error:", err);
      const response = errorResponse(err.message || "Failed to list orders");
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
      });
    }
  },

  // Update order status
  updateOrderStatus: async (call, callback) => {
    try {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      if (!userId) {
        const response = errorResponse("User not authenticated");
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: response.message,
        });
      }

      const { id, status } = call.request;

      const validStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        const response = errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: response.message,
        });
      }

      // Check if order exists and belongs to user
      const existingOrder = await prisma.orders.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        const response = errorResponse("Order not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      if (existingOrder.user_id !== userId) {
        const response = errorResponse("Access denied");
        return callback({
          code: grpc.status.PERMISSION_DENIED,
          message: response.message,
        });
      }

      const updatedOrder = await prisma.orders.update({
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

      const response = successResponse(
        {
          order: {
            id: updatedOrder.id,
            userId: updatedOrder.user_id,
            total: updatedOrder.total,
            status: updatedOrder.status,
            createdAt: updatedOrder.created_at,
            orderItems: updatedOrder.order_items.map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              title: item.product.title,
              image: item.product.image,
            })),
            paymentId: 0,
            shippingAddress: updatedOrder.shipping_address || "",
          },
        },
        "Order status updated successfully"
      );

      callback(
        null,
        UpdateOrderStatusResponse.fromPartial({
          ...response.data,
          success: response.success,
          message: response.message,
        })
      );
    } catch (err) {
      console.error("❌ Update Order Status Error:", err);

      if (err.code === "P2025") {
        const response = errorResponse("Order not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: response.message,
        });
      }

      const response = errorResponse(
        err.message || "Failed to update order status"
      );
      callback({
        code: grpc.status.INTERNAL,
        message: response.message,
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
      if (err) throw err;
      console.log(`🟢 OrderService running on port ${port}`);
    }
  );
}

startServer();

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
