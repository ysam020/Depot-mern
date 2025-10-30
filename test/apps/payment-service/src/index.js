import { PaymentServiceService } from "@depot/proto-defs/payment";
import { BaseGrpcService } from "@depot/grpc-utils";
import PaymentController from "./controllers/index.js";
import dotenv from "dotenv";

dotenv.config();

const paymentController = new PaymentController();

class PaymentService {
  static async createOrder(call, callback) {
    await paymentController.createOrder(call, callback);
  }

  static async verifyPayment(call, callback) {
    await paymentController.verifyPayment(call, callback);
  }
}

const paymentService = BaseGrpcService.createService(
  "PaymentService",
  PaymentServiceService,
  PaymentService,
  { port: process.env.PAYMENT_SERVICE_PORT || 50055 }
);

// Start the server
paymentService.start().catch((err) => {
  console.error("Failed to start PaymentService:", err);
  process.exit(1);
});
