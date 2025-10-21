import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@depot/prisma";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OrderServiceClient } from "../../dist/order.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Payment Service proto
const PAYMENT_PROTO_PATH = path.resolve(
  __dirname,
  "../../packages/proto-defs/payment.proto"
);

const paymentPackageDef = protoLoader.loadSync(PAYMENT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(paymentPackageDef).payments;

// Initialize Order Service gRPC client using generated TypeScript client
const ORDER_SERVICE_ADDRESS =
  process.env.ORDER_SERVICE_ADDRESS || "localhost:50053";

const orderClient = new OrderServiceClient(
  ORDER_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("🔑 Razorpay initialized with key:", process.env.RAZORPAY_KEY_ID);
console.log("📡 Order Service address:", ORDER_SERVICE_ADDRESS);

// Implement the payment service
const paymentServiceImpl = {
  // Create Razorpay order
  createOrder: async (call, callback) => {
    try {
      const { amount, currency, receipt } = call.request;

      console.log(
        `📝 Creating Razorpay order: Amount=${amount}, Currency=${currency}`
      );

      // Validate amount
      if (!amount || amount <= 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Amount must be greater than 0",
        });
      }

      // Create order in Razorpay
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
      });

      console.log(`✅ Razorpay order created: ${order.id}`);

      callback(null, {
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      console.error("❌ Create Order Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to create Razorpay order",
      });
    }
  },

  // Verify payment and create order
  verifyPayment: async (call, callback) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        user_id,
        cart_items,
        shipping_address,
      } = call.request;

      console.log("🔐 Verifying payment:", razorpay_payment_id);
      console.log("👤 User ID:", user_id);
      console.log("📦 Cart items:", cart_items?.length || 0, "items");
      console.log("💰 Amount:", amount);

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing payment details",
        });
      }

      if (!user_id) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "User ID is required",
        });
      }

      if (!cart_items || cart_items.length === 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Cart items are required",
        });
      }

      if (!shipping_address) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Shipping address is required",
        });
      }

      // Step 1: Verify Razorpay signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
        console.error("❌ Invalid payment signature");
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Invalid payment signature",
        });
      }

      console.log("✅ Payment signature verified");

      // Step 2: Fetch payment details from Razorpay
      let paymentDetails;
      try {
        paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        console.log(
          `💳 Payment method: ${paymentDetails.method}, Status: ${paymentDetails.status}`
        );
      } catch (fetchErr) {
        console.error("⚠️ Could not fetch payment details:", fetchErr.message);
        // Continue anyway as signature is valid
      }

      // Step 3: Check if payment already exists or create new payment
      let payment = await prisma.payments.findUnique({
        where: { razorpay_order_id: razorpay_order_id },
      });

      if (payment) {
        console.log(
          `⚠️ Payment already exists for order: ${razorpay_order_id}`
        );

        // Check if order was already created
        if (payment.order_id) {
          console.log(
            `✅ Order already created: Order ID = ${payment.order_id}`
          );

          // Return the existing payment and order info
          return callback(null, {
            success: true,
            message: "Payment already processed and order created",
            payment: {
              id: payment.id.toString(),
              order_id: payment.order_id,
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
        }

        // Payment exists but order not created - update payment details
        payment = await prisma.payments.update({
          where: { id: payment.id },
          data: {
            razorpay_payment_id,
            razorpay_signature,
            status: "completed",
            payment_method: paymentDetails?.method || "unknown",
          },
        });

        console.log(`🔄 Payment updated: ID=${payment.id}`);
      } else {
        // Create new payment
        payment = await prisma.payments.create({
          data: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            currency: "INR",
            status: "completed",
            user_id,
            payment_method: paymentDetails?.method || "unknown",
          },
        });

        console.log(`💾 Payment saved to database: ID=${payment.id}`);
      }

      // Step 4: Prepare order items for Order Service
      console.log("🔍 Raw cart items:", JSON.stringify(cart_items, null, 2));

      // CRITICAL: Convert to camelCase for OrderServiceClient (TypeScript generated)
      const orderItems = cart_items.map((item) => {
        const mappedItem = {
          id: 0, // Will be auto-generated
          orderId: 0, // ✅ camelCase! Will be set by order service
          productId: parseInt(item.id) || 0, // ✅ camelCase!
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0.0,
          title: String(item.title || ""),
          image: String(item.image || ""),
        };

        console.log(`📦 Mapped item:`, mappedItem);
        return mappedItem;
      });

      console.log("✅ All order items prepared");
      console.log("📞 Calling Order Service to create order...");

      // Step 5: Create order using Order Service (gRPC call with camelCase)
      // CRITICAL: OrderServiceClient expects camelCase field names!
      const orderRequest = {
        userId: parseInt(user_id), // ✅ camelCase!
        items: orderItems,
        total: parseFloat(amount),
        paymentId: parseInt(payment.id), // ✅ camelCase!
        shippingAddress: JSON.stringify(shipping_address), // ✅ camelCase!
      };

      console.log("📤 Order request:", JSON.stringify(orderRequest, null, 2));

      orderClient.createOrder(orderRequest, async (orderErr, orderResponse) => {
        if (orderErr) {
          console.error("❌ Order Creation Error:", orderErr);
          console.error("Error details:", {
            code: orderErr.code,
            message: orderErr.message,
            details: orderErr.details,
          });

          // Payment was successful but order creation failed
          // Update payment status to indicate issue
          await prisma.payments
            .update({
              where: { id: payment.id },
              data: { status: "payment_success_order_failed" },
            })
            .catch((updateErr) => {
              console.error("❌ Failed to update payment status:", updateErr);
            });

          return callback({
            code: grpc.status.INTERNAL,
            message: `Payment successful but order creation failed: ${orderErr.message}`,
          });
        }

        console.log(`✅ Order created: ID=${orderResponse.order.id}`);

        // Step 6: Update payment with order_id
        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: { order_id: orderResponse.order.id },
          });

          console.log(
            `🔗 Payment linked to order: Payment#${payment.id} → Order#${orderResponse.order.id}`
          );
        } catch (updateErr) {
          console.error("⚠️ Payment Update Error:", updateErr);
          // Order was created but payment update failed
          // This is less critical, continue
        }

        // Step 7: Return success response
        console.log("🎉 Payment verification complete!");

        callback(null, {
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
      });
    } catch (err) {
      console.error("❌ Verify Payment Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to verify payment",
      });
    }
  },
};

// Start the gRPC server
function startServer() {
  const server = new grpc.Server();

  server.addService(paymentProto.PaymentService.service, paymentServiceImpl);

  const PORT = process.env.PAYMENT_SERVICE_PORT || 50054;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start server:", err);
        throw err;
      }
      console.log(`🟢 PaymentService running on port ${port}`);
    }
  );
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Payment Service...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down Payment Service...");
  await prisma.$disconnect();
  process.exit(0);
});
