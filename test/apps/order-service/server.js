// import grpc from "@grpc/grpc-js";
// import prisma from "@depot/prisma";
// import {
//   getUserIdFromMetadata,
//   successResponse,
//   errorResponse,
// } from "@depot/grpc-utils";
// import {
//   OrderServiceService,
//   CreateOrderResponse,
//   GetOrderResponse,
//   ListOrdersByUserResponse,
//   UpdateOrderStatusResponse,
// } from "@depot/proto-defs/order";
// import dotenv from "dotenv";
// import { BaseGrpcService } from "@depot/grpc-utils";

// dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET;
// const VALID_ORDER_STATUSES = [
//   "pending",
//   "confirmed",
//   "shipped",
//   "delivered",
//   "cancelled",
// ];

// class OrderService extends BaseGrpcService {
//   constructor() {
//     const serviceImpl = {
//       createOrder: BaseGrpcService.wrapHandler(OrderService.createOrder),
//       getOrder: BaseGrpcService.wrapHandler(OrderService.getOrder),
//       listOrdersByUser: BaseGrpcService.wrapHandler(
//         OrderService.listOrdersByUser
//       ),
//       updateOrderStatus: BaseGrpcService.wrapHandler(
//         OrderService.updateOrderStatus
//       ),
//     };

//     super("OrderService", OrderServiceService, serviceImpl, {
//       port: process.env.ORDER_SERVICE_PORT || 50054,
//     });
//   }

//   static getUserId(metadata) {
//     const userId = getUserIdFromMetadata(metadata, JWT_SECRET);
//     if (!userId) {
//       throw new Error("User not authenticated");
//     }
//     return userId;
//   }

//   static formatOrderResponse(order) {
//     return {
//       id: order.id,
//       userId: order.user_id,
//       total: order.total,
//       status: order.status,
//       createdAt: order.created_at,
//       orderItems: order.order_items.map((item) => ({
//         id: item.id,
//         orderId: item.order_id,
//         productId: item.product_id,
//         quantity: item.quantity,
//         price: item.price,
//         title: item.product.title,
//         image: item.product.image,
//       })),
//       paymentId: order.payment_id || 0,
//       shippingAddress: order.shipping_address || "",
//     };
//   }

//   static async createOrder(call, callback) {
//     const userId = OrderService.getUserId(call.metadata);
//     const { items, total, paymentId, shippingAddress } = call.request;

//     // Validate items
//     if (!items || items.length === 0) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.INVALID_ARGUMENT,
//         "Order must contain at least one item"
//       );
//     }

//     // Create order with order items in a transaction
//     const order = await prisma.$transaction(async (tx) => {
//       // Create the order with shipping address
//       const newOrder = await tx.orders.create({
//         data: {
//           user_id: userId,
//           total,
//           status: "confirmed",
//           shipping_address: shippingAddress,
//         },
//       });

//       // Create order items
//       const orderItems = await Promise.all(
//         items.map((item) =>
//           tx.order_items.create({
//             data: {
//               order_id: newOrder.id,
//               product_id: item.productId,
//               quantity: item.quantity,
//               price: item.price,
//             },
//             include: {
//               product: {
//                 select: {
//                   title: true,
//                   image: true,
//                 },
//               },
//             },
//           })
//         )
//       );

//       // Update product quantities
//       await Promise.all(
//         items.map(async (item) => {
//           const product = await tx.products.findUnique({
//             where: { id: item.productId },
//           });

//           if (!product) {
//             throw new Error(`Product ${item.productId} not found`);
//           }

//           if (product.qty < item.quantity) {
//             throw new Error(
//               `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${item.quantity}`
//             );
//           }

//           await tx.products.update({
//             where: { id: item.productId },
//             data: { qty: product.qty - item.quantity },
//           });
//         })
//       );

//       // If paymentId is provided, link the payment to this order
//       if (paymentId) {
//         await tx.payments.update({
//           where: { id: paymentId },
//           data: { order_id: newOrder.id },
//         });
//       }

//       return {
//         ...newOrder,
//         order_items: orderItems,
//       };
//     });

//     const response = successResponse(
//       { order: OrderService.formatOrderResponse(order) },
//       "Order created successfully"
//     );

//     callback(
//       null,
//       CreateOrderResponse.fromPartial({
//         ...response.data,
//         success: response.success,
//         message: response.message,
//       })
//     );
//   }

//   static async getOrder(call, callback) {
//     const userId = OrderService.getUserId(call.metadata);
//     const { id } = call.request;

//     const order = await prisma.orders.findUnique({
//       where: { id },
//       include: {
//         order_items: {
//           include: {
//             product: {
//               select: {
//                 title: true,
//                 image: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!order) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.NOT_FOUND,
//         "Order not found"
//       );
//     }

//     // Verify order belongs to the authenticated user
//     if (order.user_id !== userId) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.PERMISSION_DENIED,
//         "Access denied"
//       );
//     }

//     const response = successResponse(
//       { order: OrderService.formatOrderResponse(order) },
//       "Order fetched successfully"
//     );

//     callback(null, GetOrderResponse.fromPartial(response.data));
//   }

//   static async listOrdersByUser(call, callback) {
//     const userId = OrderService.getUserId(call.metadata);

//     const orders = await prisma.orders.findMany({
//       where: { user_id: userId },
//       include: {
//         order_items: {
//           include: {
//             product: {
//               select: {
//                 title: true,
//                 image: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     const response = successResponse(
//       {
//         orders: orders.map((order) => OrderService.formatOrderResponse(order)),
//       },
//       "Orders fetched successfully"
//     );

//     callback(null, ListOrdersByUserResponse.fromPartial(response.data));
//   }

//   static async updateOrderStatus(call, callback) {
//     const userId = OrderService.getUserId(call.metadata);
//     const { id, status } = call.request;

//     // Validate status
//     if (!VALID_ORDER_STATUSES.includes(status)) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.INVALID_ARGUMENT,
//         `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`
//       );
//     }

//     // Check if order exists and belongs to user
//     const existingOrder = await prisma.orders.findUnique({
//       where: { id },
//     });

//     if (!existingOrder) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.NOT_FOUND,
//         "Order not found"
//       );
//     }

//     if (existingOrder.user_id !== userId) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.PERMISSION_DENIED,
//         "Access denied"
//       );
//     }

//     const updatedOrder = await prisma.orders.update({
//       where: { id },
//       data: { status },
//       include: {
//         order_items: {
//           include: {
//             product: {
//               select: {
//                 title: true,
//                 image: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     const response = successResponse(
//       { order: OrderService.formatOrderResponse(updatedOrder) },
//       "Order status updated successfully"
//     );

//     callback(
//       null,
//       UpdateOrderStatusResponse.fromPartial({
//         ...response.data,
//         success: response.success,
//         message: response.message,
//       })
//     );
//   }
// }

// // Start the server
// const orderService = new OrderService();
// orderService.start().catch((err) => {
//   console.error("Failed to start OrderService:", err);
//   process.exit(1);
// });

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

// Helper to convert Date to Timestamp format
function toTimestamp(date) {
  const milliseconds =
    date instanceof Date ? date.getTime() : new Date(date).getTime();
  const seconds = Math.trunc(milliseconds / 1000);
  const nanos = (milliseconds % 1000) * 1000000;
  return { seconds, nanos };
}

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
    // Convert JavaScript Date to Timestamp format for protobuf
    const createdAt = toTimestamp(order.created_at);

    return {
      id: order.id,
      userId: order.user_id,
      total: order.total,
      status: order.status,
      createdAt: createdAt, // Timestamp with seconds and nanos
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
    console.log("📥 Order Service - CreateOrder request received");

    const userId = OrderService.getUserId(call.metadata);
    const { items, total, paymentId, shippingAddress } = call.request;

    console.log("📋 Order details:", {
      userId,
      itemsCount: items?.length,
      total,
      paymentId,
      hasShippingAddress: !!shippingAddress,
    });

    // Validate items
    if (!items || items.length === 0) {
      console.error("❌ Order validation failed: No items");
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "Order must contain at least one item"
      );
    }

    console.log("✅ Validation passed, creating order in transaction...");

    // Create order with order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      console.log("💾 Creating order record...");
      const newOrder = await tx.orders.create({
        data: {
          user_id: userId,
          total,
          status: "pending",
          payment_id: paymentId || null,
          shipping_address: shippingAddress || "",
        },
      });
      console.log("✅ Order created:", { orderId: newOrder.id });

      // Create order items and update product quantities
      console.log("📦 Processing order items...");
      const orderItems = await Promise.all(
        items.map(async (item, index) => {
          console.log(`  Processing item ${index + 1}/${items.length}:`, {
            productId: item.productId,
            quantity: item.quantity,
          });

          // Fetch product to verify stock
          const product = await tx.products.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            console.error(`❌ Product not found: ${item.productId}`);
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.qty < item.quantity) {
            console.error(
              `❌ Insufficient stock for product ${item.productId}`
            );
            throw new Error(
              `Insufficient stock for product ${item.productId}. Available: ${product.qty}, Requested: ${item.quantity}`
            );
          }

          // Create order item
          const orderItem = await tx.order_items.create({
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
          });

          // Update product quantity
          await tx.products.update({
            where: { id: item.productId },
            data: { qty: product.qty - item.quantity },
          });

          console.log(`  ✅ Item ${index + 1} processed`);
          return orderItem;
        })
      );

      console.log("✅ All order items processed");

      // If paymentId is provided, link the payment to this order
      if (paymentId) {
        console.log("🔗 Linking payment to order...");
        await tx.payments.update({
          where: { id: paymentId },
          data: { order_id: newOrder.id },
        });
        console.log("✅ Payment linked");
      }

      return {
        ...newOrder,
        order_items: orderItems,
      };
    });

    console.log("✅ Transaction completed successfully");

    const formattedOrder = OrderService.formatOrderResponse(order);

    const response = CreateOrderResponse.fromPartial({
      order: formattedOrder,
      success: true,
      message: "Order created successfully",
    });

    console.log("📤 Order Service - Sending CreateOrderResponse:", {
      orderId: response.order.id,
      success: response.success,
      itemsCount: response.order.orderItems?.length,
    });

    callback(null, response);
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

    callback(
      null,
      GetOrderResponse.fromPartial({
        order: OrderService.formatOrderResponse(order),
      })
    );
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

    callback(
      null,
      ListOrdersByUserResponse.fromPartial({
        orders: orders.map((order) => OrderService.formatOrderResponse(order)),
      })
    );
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
      UpdateOrderStatusResponse.fromPartial({
        order: OrderService.formatOrderResponse(updatedOrder),
        success: true,
        message: "Order status updated successfully",
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
