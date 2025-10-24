// import grpc from "@grpc/grpc-js";
// import protoLoader from "@grpc/proto-loader";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import prisma from "@depot/prisma";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import { OrderServiceClient } from "../../dist/order.js";
// import { BaseGrpcService } from "@depot/grpc-utils";

// dotenv.config();

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Load Payment Service proto
// const PAYMENT_PROTO_PATH = path.resolve(
//   __dirname,
//   "../../packages/proto-defs/src/proto/payment.proto"
// );

// const paymentPackageDef = protoLoader.loadSync(PAYMENT_PROTO_PATH, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });

// const paymentProto = grpc.loadPackageDefinition(paymentPackageDef).payments;

// // Initialize Order Service gRPC client
// const ORDER_SERVICE_ADDRESS = process.env.ORDER_SERVICE_ADDRESS;
// const orderClient = new OrderServiceClient(
//   ORDER_SERVICE_ADDRESS,
//   grpc.credentials.createInsecure()
// );

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// class PaymentService extends BaseGrpcService {
//   constructor() {
//     const serviceImpl = {
//       createOrder: BaseGrpcService.wrapHandler(
//         PaymentService.createRazorpayOrder
//       ),
//       verifyPayment: BaseGrpcService.wrapHandler(PaymentService.verifyPayment),
//     };

//     super("PaymentService", paymentProto.PaymentService.service, serviceImpl, {
//       port: process.env.PAYMENT_SERVICE_PORT || 50056,
//     });
//   }

//   static verifySignature(orderId, paymentId, signature) {
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${orderId}|${paymentId}`)
//       .digest("hex");

//     return generatedSignature === signature;
//   }

//   static forwardAuthMetadata(sourceMetadata) {
//     const metadata = new grpc.Metadata();
//     const authHeader = sourceMetadata.get("authorization")[0];

//     if (authHeader) {
//       metadata.add("authorization", authHeader);
//     } else {
//       console.warn("⚠️ No authorization header found in metadata");
//     }

//     return metadata;
//   }

//   static async clearUserCart(userId) {
//     try {
//       const userCart = await prisma.carts.findUnique({
//         where: { user_id: userId },
//       });

//       if (userCart) {
//         await prisma.cart_items.deleteMany({
//           where: { cart_id: userCart.id },
//         });
//       }
//     } catch (err) {
//       console.error("⚠️ Failed to clear cart:", err);
//     }
//   }

//   static async createRazorpayOrder(call, callback) {
//     const { amount, currency, receipt } = call.request;

//     // Validate amount
//     if (!amount || amount <= 0) {
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.INVALID_ARGUMENT,
//         "Amount must be greater than 0"
//       );
//     }

//     // Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: amount, // Amount in paise
//       currency: currency || "INR",
//       receipt: receipt || `receipt_${Date.now()}`,
//     });

//     callback(null, {
//       razorpay_order_id: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       key_id: process.env.RAZORPAY_KEY_ID,
//     });
//   }

//   static async verifyPayment(call, callback) {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       amount,
//       user_id,
//       cart_items,
//       shipping_address,
//     } = call.request;

//     // Step 1: Verify signature
//     if (
//       !PaymentService.verifySignature(
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature
//       )
//     ) {
//       console.error("❌ Signature verification failed");
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.INVALID_ARGUMENT,
//         "Invalid payment signature"
//       );
//     }

//     // Step 2: Fetch payment details from Razorpay
//     let razorpayPaymentDetails;
//     try {
//       razorpayPaymentDetails =
//         await razorpay.payments.fetch(razorpay_payment_id);
//     } catch (fetchErr) {
//       console.error("❌ Failed to fetch payment from Razorpay:", fetchErr);
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.INTERNAL,
//         "Failed to fetch payment details from Razorpay"
//       );
//     }

//     // Step 3: Verify payment status
//     if (razorpayPaymentDetails.status !== "captured") {
//       console.error(
//         `❌ Payment not captured: ${razorpayPaymentDetails.status}`
//       );
//       return BaseGrpcService.sendError(
//         callback,
//         grpc.status.FAILED_PRECONDITION,
//         `Payment not captured. Status: ${razorpayPaymentDetails.status}`
//       );
//     }

//     // Step 4: Save payment to database
//     const payment = await prisma.payments.create({
//       data: {
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//         amount,
//         currency: razorpayPaymentDetails.currency || "INR",
//         status: "success",
//         payment_method: razorpayPaymentDetails.method || "unknown",
//         user_id,
//       },
//     });

//     // Step 5: Prepare order items
//     const orderItems = cart_items.map((item) => ({
//       id: 0,
//       orderId: 0,
//       productId: parseInt(item.id) || 0,
//       quantity: parseInt(item.quantity) || 0,
//       price: parseFloat(item.price) || 0,
//       title: String(item.title || ""),
//       image: String(item.image || ""),
//     }));

//     const orderRequest = {
//       userId: 0, // Extracted from JWT in order service
//       items: orderItems,
//       total: parseFloat(amount) || 0,
//       paymentId: parseInt(payment.id) || 0,
//       shippingAddress: shipping_address ? JSON.stringify(shipping_address) : "",
//     };

//     // Step 6: Forward authorization metadata
//     const metadata = PaymentService.forwardAuthMetadata(call.metadata);

//     // Step 7: Create order via Order Service
//     orderClient.createOrder(
//       orderRequest,
//       metadata,
//       async (orderErr, orderResponse) => {
//         if (orderErr) {
//           console.error("❌ Order Creation Error:", orderErr);
//           console.error("Error details:", {
//             code: orderErr.code,
//             message: orderErr.message,
//             details: orderErr.details,
//           });

//           // Payment was successful but order creation failed
//           await prisma.payments
//             .update({
//               where: { id: payment.id },
//               data: { status: "payment_success_order_failed" },
//             })
//             .catch((updateErr) => {
//               console.error("❌ Failed to update payment status:", updateErr);
//             });

//           return BaseGrpcService.sendError(
//             callback,
//             grpc.status.INTERNAL,
//             `Payment successful but order creation failed: ${orderErr.message}`
//           );
//         }

//         // Step 8: Update payment with order_id
//         try {
//           await prisma.payments.update({
//             where: { id: payment.id },
//             data: { order_id: orderResponse.order.id },
//           });
//         } catch (updateErr) {
//           console.error("⚠️ Payment Update Error:", updateErr);
//         }

//         // Step 9: Clear user's cart
//         await PaymentService.clearUserCart(user_id);

//         // Step 10: Return success response
//         callback(null, {
//           success: true,
//           message: "Payment verified and order created successfully",
//           payment: {
//             id: payment.id.toString(),
//             order_id: orderResponse.order.id,
//             razorpay_order_id: payment.razorpay_order_id,
//             razorpay_payment_id: payment.razorpay_payment_id,
//             razorpay_signature: payment.razorpay_signature,
//             amount: payment.amount,
//             currency: payment.currency,
//             status: payment.status,
//             user_id: payment.user_id,
//             payment_method: payment.payment_method,
//           },
//         });
//       }
//     );
//   }
// }

// // Start the server
// const paymentService = new PaymentService();
// paymentService.start().catch((err) => {
//   console.error("Failed to start PaymentService:", err);
//   process.exit(1);
// });

import grpc from "@grpc/grpc-js";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@depot/prisma";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

// ✅ Import from generated proto definitions (via package exports)
import {
  PaymentServiceService,
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "@depot/proto-defs/payment";

import { OrderServiceClient } from "@depot/proto-defs/order";

dotenv.config();

// Initialize Order Service gRPC client
const ORDER_SERVICE_ADDRESS = process.env.ORDER_SERVICE_ADDRESS;
console.log("🔍 Order Service Address:", ORDER_SERVICE_ADDRESS);
console.log("🔍 OrderServiceClient constructor:", OrderServiceClient);

const orderClient = new OrderServiceClient(
  ORDER_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

console.log("🔍 Order client created");
console.log(
  "🔍 Available methods on orderClient:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(orderClient))
);
console.log("🔍 orderClient.createOrder:", typeof orderClient.createOrder);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      createOrder: BaseGrpcService.wrapHandler(
        PaymentService.createRazorpayOrder
      ),
      verifyPayment: BaseGrpcService.wrapHandler(PaymentService.verifyPayment),
    };

    super(
      "PaymentService",
      PaymentServiceService, // ✅ Using generated service definition
      serviceImpl,
      {
        port: process.env.PAYMENT_SERVICE_PORT || 50055,
      }
    );
  }

  static verifySignature(orderId, paymentId, signature) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  static forwardAuthMetadata(sourceMetadata) {
    const metadata = new grpc.Metadata();
    const authHeader = sourceMetadata.get("authorization")[0];

    if (authHeader) {
      metadata.add("authorization", authHeader);
    } else {
      console.warn("⚠️ No authorization header found in metadata");
    }

    return metadata;
  }

  static async clearUserCart(userId) {
    try {
      const userCart = await prisma.carts.findUnique({
        where: { user_id: userId },
      });

      if (userCart) {
        await prisma.cart_items.deleteMany({
          where: { cart_id: userCart.id },
        });
      }
    } catch (err) {
      console.error("⚠️ Failed to clear cart:", err);
    }
  }

  static async createRazorpayOrder(call, callback) {
    const { amount, currency, receipt } = call.request;

    console.log("📥 Payment Service - CreateRazorpayOrder request:", {
      amount,
      currency,
      receipt,
    });

    // Validate amount
    if (!amount || amount <= 0) {
      console.error("❌ Amount validation failed:", amount);
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "Amount must be greater than 0"
      );
    }

    try {
      console.log("🔄 Creating Razorpay order...");

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
      });

      console.log("✅ Razorpay order created:", {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });

      // Use snake_case to match the compiled proto definition
      const response = CreateOrderResponse.fromPartial({
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });

      console.log(
        "📤 Payment Service - Sending CreateOrderResponse:",
        JSON.stringify(response, null, 2)
      );

      callback(null, response);
    } catch (error) {
      console.error("❌ Create order error:", error);
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INTERNAL,
        error.message
      );
    }
  }

  static async verifyPayment(call, callback) {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      userId,
      cartItems,
      shippingAddress,
    } = call.request;

    console.log("📥 Payment Service - VerifyPayment request:", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      userId,
      cartItemsCount: cartItems?.length,
      hasShippingAddress: !!shippingAddress,
    });

    // Step 1: Verify signature
    console.log("🔐 Step 1: Verifying signature...");
    if (
      !PaymentService.verifySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      )
    ) {
      console.error("❌ Signature verification failed");
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "Invalid payment signature"
      );
    }
    console.log("✅ Signature verified");

    // Step 2: Fetch payment details from Razorpay
    console.log("🔄 Step 2: Fetching payment details from Razorpay...");
    let razorpayPaymentDetails;
    try {
      razorpayPaymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
      console.log("✅ Payment details fetched:", {
        status: razorpayPaymentDetails.status,
        method: razorpayPaymentDetails.method,
      });
    } catch (fetchErr) {
      console.error("❌ Failed to fetch payment from Razorpay:", fetchErr);
      return BaseGrpcService.sendError(
        callback,
        grpc.status.INTERNAL,
        "Failed to fetch payment details from Razorpay"
      );
    }

    // Step 3: Verify payment status
    console.log("🔍 Step 3: Verifying payment status...");
    if (razorpayPaymentDetails.status !== "captured") {
      console.error(
        `❌ Payment not captured: ${razorpayPaymentDetails.status}`
      );
      return BaseGrpcService.sendError(
        callback,
        grpc.status.FAILED_PRECONDITION,
        `Payment not captured. Status: ${razorpayPaymentDetails.status}`
      );
    }
    console.log("✅ Payment status verified: captured");

    // Step 4: Save payment to database
    console.log("💾 Step 4: Saving payment to database...");
    const payment = await prisma.payments.create({
      data: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        amount,
        currency: razorpayPaymentDetails.currency || "INR",
        status: "success",
        payment_method: razorpayPaymentDetails.method || "unknown",
        user_id: userId,
      },
    });
    console.log("✅ Payment saved to database:", { paymentId: payment.id });

    // Step 5: Prepare order items with camelCase for TypeScript generated client
    console.log("📦 Step 5: Preparing order items...");
    const orderItems = cartItems.map((item) => ({
      id: 0,
      orderId: 0,
      productId: parseInt(item.id) || 0,
      quantity: parseInt(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      title: String(item.title || ""),
      image: String(item.image || ""),
    }));

    // Convert to camelCase for TypeScript generated OrderServiceClient
    const orderRequest = {
      userId: userId, // ✅ camelCase
      items: orderItems,
      total: parseFloat(amount) || 0,
      paymentId: parseInt(payment.id) || 0, // ✅ camelCase
      shippingAddress: shippingAddress // ✅ camelCase
        ? JSON.stringify(shippingAddress)
        : "",
    };

    console.log("📋 Order request prepared:", {
      userId: orderRequest.userId,
      itemsCount: orderRequest.items.length,
      total: orderRequest.total,
      paymentId: orderRequest.paymentId,
    });

    // Step 6: Forward authorization metadata
    const metadata = PaymentService.forwardAuthMetadata(call.metadata);

    // Step 7: Create order via Order Service
    console.log("🔄 Step 7: Calling Order Service to create order...");
    orderClient.createOrder(
      // ✅ camelCase method name
      orderRequest,
      metadata,
      async (orderErr, orderResponse) => {
        if (orderErr) {
          console.error("❌ Order Creation Error:", orderErr);
          console.error("Error details:", {
            code: orderErr.code,
            message: orderErr.message,
            details: orderErr.details,
          });

          // Payment was successful but order creation failed
          await prisma.payments
            .update({
              where: { id: payment.id },
              data: { status: "payment_success_order_failed" },
            })
            .catch((updateErr) => {
              console.error("❌ Failed to update payment status:", updateErr);
            });

          return BaseGrpcService.sendError(
            callback,
            grpc.status.INTERNAL,
            `Payment successful but order creation failed: ${orderErr.message}`
          );
        }

        console.log("✅ Order created successfully:", {
          orderId: orderResponse.order.id,
          status: orderResponse.order.status,
        });

        // Step 8: Update payment with order_id
        console.log("💾 Step 8: Updating payment with order_id...");
        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: { order_id: orderResponse.order.id },
          });
          console.log("✅ Payment updated with order_id");
        } catch (updateErr) {
          console.error("⚠️ Payment Update Error:", updateErr);
        }

        // Step 9: Clear user's cart
        console.log("🧹 Step 9: Clearing user cart...");
        await PaymentService.clearUserCart(userId);
        console.log("✅ Cart cleared");

        // Step 10: Use snake_case to match the compiled proto
        const finalResponse = VerifyPaymentResponse.fromPartial({
          success: true,
          message: "Payment verified and order created successfully",
          payment: {
            id: payment.id.toString(),
            order_id: orderResponse.order.id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            user_id: payment.user_id,
            payment_method: payment.payment_method,
          },
        });

        console.log(
          "📤 Step 10: Sending VerifyPaymentResponse:",
          JSON.stringify(finalResponse, null, 2)
        );

        callback(null, finalResponse);
      }
    );
  }
}

// Start the server
const paymentService = new PaymentService();
paymentService.start().catch((err) => {
  console.error("Failed to start PaymentService:", err);
  process.exit(1);
});
