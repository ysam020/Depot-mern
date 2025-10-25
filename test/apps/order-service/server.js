import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { getUserIdFromMetadata } from "@depot/grpc-utils";
import {
  OrderServiceService,
  CreateOrderResponse,
  GetOrderResponse,
  ListOrdersByUserResponse,
  UpdateOrderStatusResponse,
} from "@depot/proto-defs/order";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const VALID_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

class OrderService {
  static formatOrderResponse(order) {
    // Ensure we have a proper Date object
    const dateObj =
      order.created_at instanceof Date
        ? order.created_at
        : new Date(order.created_at || Date.now());

    const response = {
      id: order.id,
      user_id: order.user_id,
      total: order.total,
      status: order.status,
      created_at: dateObj,
      order_items: order.order_items.map((item) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        title: item.product.title,
        image: item.product.image,
      })),
      payment_id: order.payment_id || 0,
      shipping_address: order.shipping_address || "",
    };

    return response;
  }

  static async createOrder(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      // getUserIdFromMetadata throws if auth fails - asyncHandler catches it
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);

      const { items, total, payment_id, shipping_address } = call.request;

      // Validate items
      if (!items || items.length === 0) {
        console.error("Validation failed: No items");
        return BaseGrpcService.sendError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "Order must contain at least one item"
        );
      }

      // Create order with order items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create the order with shipping address
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId,
            total,
            status: "confirmed",
            shipping_address,
          },
        });

        // Create order items and update product quantities
        const orderItems = await Promise.all(
          items.map(async (item, index) => {
            // Fetch product to check availability
            const product = await tx.products.findUnique({
              where: { id: item.product_id },
            });

            if (!product) {
              throw new Error(`Product ${item.product_id} not found`);
            }

            if (product.qty < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${item.quantity}`
              );
            }

            // Create order item
            const orderItem = await tx.order_items.create({
              data: {
                order_id: newOrder.id,
                product_id: item.product_id,
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
            });

            // Update product quantity
            await tx.products.update({
              where: { id: item.product_id },
              data: { qty: product.qty - item.quantity },
            });

            return orderItem;
          })
        );

        // If payment_id is provided, link the payment to this order
        if (payment_id) {
          await tx.payments.update({
            where: { id: payment_id },
            data: { order_id: newOrder.id },
          });
        }

        // Return the complete order with proper created_at
        const completeOrder = {
          ...newOrder,
          order_items: orderItems,
          // Ensure created_at is a proper Date object
          created_at:
            newOrder.created_at instanceof Date
              ? newOrder.created_at
              : new Date(newOrder.created_at || Date.now()),
        };

        return completeOrder;
      });

      const formattedOrder = OrderService.formatOrderResponse(order);

      callback(
        null,
        BaseGrpcService.successResponse(CreateOrderResponse, {
          order: formattedOrder,
          success: true,
          message: "Order created successfully",
        })
      );
    });
  }

  static async getOrder(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const user_id = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id } = call.request;
      const order = await prisma.orders.findUnique({
        where: { id, user_id },
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
        return BaseGrpcService.sendError(
          callback,
          grpc.status.NOT_FOUND,
          "Order not found"
        );
      }

      // Verify order belongs to the authenticated user
      if (order.user_id !== user_id) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.PERMISSION_DENIED,
          "Access denied"
        );
      }

      callback(
        null,
        BaseGrpcService.successResponse(GetOrderResponse, {
          order: OrderService.formatOrderResponse(order),
        })
      );
    });
  }

  static async listOrdersByUser(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const user_id = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const orders = await prisma.orders.findMany({
        where: { user_id },
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
        BaseGrpcService.successResponse(ListOrdersByUserResponse, {
          orders: orders.map((order) =>
            OrderService.formatOrderResponse(order)
          ),
        })
      );
    });
  }

  static async updateOrderStatus(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const userId = getUserIdFromMetadata(call.metadata, JWT_SECRET);
      const { id, status } = call.request;

      // Validate status
      if (!VALID_ORDER_STATUSES.includes(status)) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`
        );
      }

      // Fetch order
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
        return BaseGrpcService.sendError(
          callback,
          grpc.status.NOT_FOUND,
          "Order not found"
        );
      }

      // Verify order belongs to the authenticated user
      if (order.user_id !== userId) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.PERMISSION_DENIED,
          "Access denied"
        );
      }

      // Update order status
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

      callback(
        null,
        BaseGrpcService.successResponse(UpdateOrderStatusResponse, {
          order: OrderService.formatOrderResponse(updatedOrder),
          success: true,
          message: "Order status updated successfully",
        })
      );
    });
  }
}

const orderService = BaseGrpcService.createService(
  "OrderService",
  OrderServiceService,
  OrderService,
  { port: process.env.ORDER_SERVICE_PORT || 50054 }
);

// Start the server
orderService.start().catch((err) => {
  console.error("Failed to start OrderService:", err);
  process.exit(1);
});
