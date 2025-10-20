import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@depot/prisma";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

// Load Order Service proto for client
const ORDER_PROTO_PATH = path.resolve(
  __dirname,
  "../../packages/proto-defs/order.proto"
);

const orderPackageDef = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const orderProto = grpc.loadPackageDefinition(orderPackageDef).orders;

// Initialize Order Service gRPC client
const ORDER_SERVICE_ADDRESS =
  process.env.ORDER_SERVICE_ADDRESS || "localhost:50053";

const orderClient = new orderProto.OrderService(
  ORDER_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("🔑 Razorpay initialized with key:", process.env.RAZORPAY_KEY_ID);

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

      console.log(`🔐 Verifying payment: ${razorpay_payment_id}`);
      console.log(`👤 User ID: ${user_id}`);
      console.log(`📦 Cart items: ${cart_items?.length || 0} items`);

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

      // Step 3: Save payment to database
      const payment = await prisma.payments.create({
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

      // Step 4: Prepare order items for Order Service
      const orderItems = cart_items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        title: item.title || "",
        image: item.image || "",
      }));

      console.log(`📞 Calling Order Service to create order...`);

      // Step 5: Create order using Order Service (gRPC call)
      orderClient.createOrder(
        {
          user_id,
          items: orderItems,
          total: amount,
          payment_id: payment.id,
          shipping_address: JSON.stringify(shipping_address),
        },
        async (orderErr, orderResponse) => {
          if (orderErr) {
            console.error("❌ Order Creation Error:", orderErr);

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

          console.log(
            `🎉 Payment verification complete! Order #${orderResponse.order.id} created for user ${user_id}`
          );
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
      console.log(`📡 Available methods: CreateOrder, VerifyPayment`);
      console.log(`🔗 Connected to OrderService at ${ORDER_SERVICE_ADDRESS}`);
      console.log(
        `💳 Razorpay Mode: ${process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test") ? "TEST" : "LIVE"}`
      );
    }
  );
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down PaymentService...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down PaymentService...");
  await prisma.$disconnect();
  process.exit(0);
});

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected");
    startServer();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
