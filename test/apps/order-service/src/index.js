import { OrderServiceService } from "@depot/proto-defs/order";
import { BaseGrpcService } from "@depot/grpc-utils";
import OrderController from "./controllers/index.js";
import dotenv from "dotenv";

dotenv.config();

const orderController = new OrderController();

class OrderService {
  static async createOrder(call, callback) {
    await orderController.createOrder(call, callback);
  }

  static async getOrder(call, callback) {
    await orderController.getOrder(call, callback);
  }

  static async listOrdersByUser(call, callback) {
    await orderController.listOrdersByUser(call, callback);
  }

  static async updateOrderStatus(call, callback) {
    await orderController.updateOrderStatus(call, callback);
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
