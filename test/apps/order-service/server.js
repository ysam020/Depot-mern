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

// Helper function to convert Date to Timestamp - COMPREHENSIVE VERSION
function toTimestamp(date) {
  console.log("📅 toTimestamp called with:", {
    type: typeof date,
    value: date,
    isDate: date instanceof Date,
  });

  if (!date) {
    // Return current timestamp if date is null/undefined
    const now = Date.now();
    console.log("⚠️ Date is null/undefined, using current time");
    return {
      seconds: Math.trunc(now / 1000),
      nanos: (now % 1000) * 1000000,
    };
  }

  let milliseconds;

  if (date instanceof Date) {
    milliseconds = date.getTime();
    console.log("✅ Date is Date object, milliseconds:", milliseconds);
  } else if (typeof date === "string") {
    milliseconds = new Date(date).getTime();
    console.log("✅ Date is string, converted to milliseconds:", milliseconds);
  } else if (typeof date === "number") {
    milliseconds = date;
    console.log("✅ Date is number (milliseconds):", milliseconds);
  } else if (date.seconds !== undefined) {
    // Already a timestamp object
    console.log("✅ Date is already a timestamp object");
    return {
      seconds: date.seconds,
      nanos: date.nanos || 0,
    };
  } else {
    // Try to convert to date
    console.log("⚠️ Date type unknown, attempting conversion");
    milliseconds = new Date(date).getTime();
  }

  const seconds = Math.trunc(milliseconds / 1000);
  const nanos = (milliseconds % 1000) * 1000000;

  const result = { seconds, nanos };
  console.log("✅ toTimestamp result:", result);
  return result;
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
    console.log("🔍 Formatting order response for order:", order.id);
    console.log("🔍 Order created_at type:", typeof order.created_at);
    console.log("🔍 Order created_at value:", order.created_at);
    console.log(
      "🔍 Order created_at constructor:",
      order.created_at?.constructor?.name
    );

    // Convert JavaScript Date to Timestamp format for protobuf
    let created_at;
    try {
      // Ensure we have a proper Date object
      const dateObj =
        order.created_at instanceof Date
          ? order.created_at
          : new Date(order.created_at || Date.now());

      created_at = toTimestamp(dateObj);
      console.log("✅ Timestamp created:", created_at);
    } catch (err) {
      console.error("❌ Error creating timestamp:", err);
      console.error("Stack:", err.stack);
      // Fallback to current time if conversion fails
      created_at = toTimestamp(new Date());
    }

    // ✅ EVERYTHING uses snake_case
    const response = {
      id: order.id,
      user_id: order.user_id, // ✅ snake_case
      total: order.total,
      status: order.status,
      created_at: created_at, // ✅ snake_case
      order_items: order.order_items.map((item) => ({
        // ✅ snake_case
        id: item.id,
        order_id: item.order_id, // ✅ snake_case
        product_id: item.product_id, // ✅ snake_case
        quantity: item.quantity,
        price: item.price,
        title: item.product.title,
        image: item.product.image,
      })),
      payment_id: order.payment_id || 0, // ✅ snake_case
      shipping_address: order.shipping_address || "", // ✅ snake_case
    };

    console.log("📦 Formatted response (without order_items):", {
      id: response.id,
      user_id: response.user_id,
      total: response.total,
      status: response.status,
      created_at: response.created_at,
      payment_id: response.payment_id,
      order_items_count: response.order_items.length,
    });

    return response;
  }

  static async createOrder(call, callback) {
    console.log("📥 Order Service - CreateOrder request received");

    const userId = OrderService.getUserId(call.metadata);

    // ✅ Use snake_case to match proto definition
    const { items, total, payment_id, shipping_address } = call.request;

    console.log("📋 Order details:", {
      userId,
      itemsCount: items?.length,
      total,
      payment_id,
      hasShippingAddress: !!shipping_address,
    });

    console.log("📦 Full request data:", JSON.stringify(call.request, null, 2));

    // Validate items
    if (!items || items.length === 0) {
      console.error("❌ Validation failed: No items");
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "Order must contain at least one item"
      );
    }

    try {
      // Create order with order items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        console.log("🔄 Creating order in database...");

        // Create the order with shipping address
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId,
            total,
            status: "confirmed",
            shipping_address,
          },
        });

        console.log("✅ Order created:", {
          orderId: newOrder.id,
          created_at: newOrder.created_at,
          created_at_type: typeof newOrder.created_at,
        });

        // Create order items and update product quantities
        console.log("📦 Processing order items...");
        const orderItems = await Promise.all(
          items.map(async (item, index) => {
            console.log(`  ⚙️  Processing item ${index + 1}:`, {
              product_id: item.product_id,
              quantity: item.quantity,
            });

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

            console.log(`  ✅ Item ${index + 1} processed`);
            return orderItem;
          })
        );

        console.log("✅ All order items processed");

        // If payment_id is provided, link the payment to this order
        if (payment_id) {
          console.log("🔗 Linking payment to order...");
          await tx.payments.update({
            where: { id: payment_id },
            data: { order_id: newOrder.id },
          });
          console.log("✅ Payment linked");
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

        console.log("📦 Complete order before formatting:", {
          id: completeOrder.id,
          created_at: completeOrder.created_at,
          created_at_type: typeof completeOrder.created_at,
          created_at_constructor: completeOrder.created_at?.constructor?.name,
        });

        return completeOrder;
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
        itemsCount: response.order.order_items?.length,
        created_at: response.order.created_at,
      });

      callback(null, response);
    } catch (error) {
      console.error("❌ Create order error:", error);
      console.error("Error stack:", error.stack);
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INTERNAL,
        error.message
      );
    }
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

    // ✅ Use snake_case
    const { user_id } = call.request;

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
