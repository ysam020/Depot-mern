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

class OrderService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      createOrder: BaseGrpcService.wrapHandler(OrderService.createOrder),
      getOrder: BaseGrpcService.wrapHandler(OrderService.getOrder),
      listOrdersByUser: BaseGrpcService.wrapHandler(
        OrderService.listOrdersByUser
      ),
      updateOrderStatus: BaseGrpcService.wrapHandler(
        OrderService.updateOrderStatus
      ),
    };

    super("OrderService", OrderServiceService, serviceImpl, {
      port: process.env.ORDER_SERVICE_PORT || 50054,
    });
  }

  static getUserId(metadata) {
    const userId = getUserIdFromMetadata(metadata, JWT_SECRET);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return userId;
  }

  static formatOrderResponse(order) {
    return {
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
      paymentId: order.payment_id || 0,
      shippingAddress: order.shipping_address || "",
    };
  }

  static async createOrder(call, callback) {
    const userId = OrderService.getUserId(call.metadata);
    const { items, total, paymentId, shippingAddress } = call.request;

    // Validate items
    if (!items || items.length === 0) {
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
          shipping_address: shippingAddress,
        },
      });

      // Create order items
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
        })
      );

      // If paymentId is provided, link the payment to this order
      if (paymentId) {
        await tx.payments.update({
          where: { id: paymentId },
          data: { order_id: newOrder.id },
        });
      }

      return {
        ...newOrder,
        order_items: orderItems,
      };
    });

    const response = successResponse(
      { order: OrderService.formatOrderResponse(order) },
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
  }

  static async getOrder(call, callback) {
    const userId = OrderService.getUserId(call.metadata);
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

    const response = successResponse(
      { order: OrderService.formatOrderResponse(order) },
      "Order fetched successfully"
    );

    callback(null, GetOrderResponse.fromPartial(response.data));
  }

  static async listOrdersByUser(call, callback) {
    const userId = OrderService.getUserId(call.metadata);

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
        orders: orders.map((order) => OrderService.formatOrderResponse(order)),
      },
      "Orders fetched successfully"
    );

    callback(null, ListOrdersByUserResponse.fromPartial(response.data));
  }

  static async updateOrderStatus(call, callback) {
    const userId = OrderService.getUserId(call.metadata);
    const { id, status } = call.request;

    // Validate status
    if (!VALID_ORDER_STATUSES.includes(status)) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`
      );
    }

    // Check if order exists and belongs to user
    const existingOrder = await prisma.orders.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.NOT_FOUND,
        "Order not found"
      );
    }

    if (existingOrder.user_id !== userId) {
      return BaseGrpcService.sendError(
        callback,
        grpc.status.PERMISSION_DENIED,
        "Access denied"
      );
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
      { order: OrderService.formatOrderResponse(updatedOrder) },
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
  }
}

// Start the server
const orderService = new OrderService();
orderService.start().catch((err) => {
  console.error("Failed to start OrderService:", err);
  process.exit(1);
});
