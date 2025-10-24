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

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
      });

      console.log(`✅ Razorpay order created: ${razorpayOrder.id}`);

      callback(null, {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      console.error("❌ Create Razorpay Order Error:", err);
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

      console.log("🔍 Verifying payment:", {
        razorpay_order_id,
        razorpay_payment_id,
        user_id,
        amount,
        items_count: cart_items?.length,
      });

      // Step 1: Verify signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("❌ Signature verification failed");
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Invalid payment signature",
        });
      }

      console.log("✅ Payment signature verified");

      // Step 2: Fetch payment details from Razorpay
      let razorpayPaymentDetails;
      try {
        razorpayPaymentDetails =
          await razorpay.payments.fetch(razorpay_payment_id);
        console.log(
          `✅ Razorpay payment fetched: Status=${razorpayPaymentDetails.status}`
        );
      } catch (fetchErr) {
        console.error("❌ Failed to fetch payment from Razorpay:", fetchErr);
        return callback({
          code: grpc.status.INTERNAL,
          message: "Failed to fetch payment details from Razorpay",
        });
      }

      // Step 3: Verify payment status
      if (razorpayPaymentDetails.status !== "captured") {
        console.error(
          `❌ Payment not captured: ${razorpayPaymentDetails.status}`
        );
        return callback({
          code: grpc.status.FAILED_PRECONDITION,
          message: `Payment not captured. Status: ${razorpayPaymentDetails.status}`,
        });
      }

      // Step 4: Save payment to database
      const payment = await prisma.payments.create({
        data: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          currency: razorpayPaymentDetails.currency || "INR",
          status: "success",
          payment_method: razorpayPaymentDetails.method || "unknown",
          user_id,
        },
      });

      console.log(`✅ Payment saved: ID=${payment.id}`);

      // Step 5: Prepare order items
      const orderItems = cart_items.map((item) => ({
        id: 0, // Will be set by database
        orderId: 0, // Will be set by database
        productId: parseInt(item.id) || 0,
        quantity: parseInt(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        title: String(item.title || ""),
        image: String(item.image || ""),
      }));

      const orderRequest = {
        userId: 0, // Dummy value - actual userId extracted from JWT metadata in order service
        items: orderItems,
        total: parseFloat(amount) || 0,
        paymentId: parseInt(payment.id) || 0,
        shippingAddress: shipping_address
          ? JSON.stringify(shipping_address)
          : "",
      };

      console.log("📤 Order request:", JSON.stringify(orderRequest, null, 2));

      // CRITICAL FIX: Forward the authorization metadata from the incoming call to the order service
      const metadata = new grpc.Metadata();
      const authHeader = call.metadata.get("authorization")[0];
      if (authHeader) {
        metadata.add("authorization", authHeader);
        console.log("✅ Forwarding authorization metadata to order service");
      } else {
        console.warn("⚠️ No authorization header found in metadata");
      }

      // Step 6: Create order via Order Service with forwarded metadata
      orderClient.createOrder(
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

          // Step 7: Update payment with order_id
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

          // Step 8: Clear user's cart after successful order
          try {
            const userCart = await prisma.carts.findUnique({
              where: { user_id },
            });

            if (userCart) {
              await prisma.cart_items.deleteMany({
                where: { cart_id: userCart.id },
              });
              console.log(`🛒 Cart cleared for user ${user_id}`);
            }
          } catch (cartErr) {
            console.error("⚠️ Failed to clear cart:", cartErr);
            // Non-critical error, continue
          }

          // Step 9: Return success response
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
        }
      );
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
