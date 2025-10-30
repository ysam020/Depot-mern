import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { OrderServiceClient } from "@depot/proto-defs/order";

class OrderController extends BaseController {
  constructor() {
    const orderClient = grpcClientManager.getClient(
      "ORDER_SERVICE",
      OrderServiceClient
    );
    super(orderClient);
  }

  listOrders = async (req, res) => {
    const userId = this.getUserId(req);

    if (!userId) {
      return this.sendUnauthorized(res);
    }

    await this.executeGrpcCall(
      req,
      res,
      "listOrdersByUser",
      { user_id: userId },
      {
        transformer: (response) => ({ orders: response.orders || [] }),
        successMessage: "Orders fetched successfully",
        errorMessage: "Failed to fetch orders",
        includeMetadata: true,
      }
    );
  };

  getOrder = async (req, res) => {
    const userId = this.getUserId(req);

    if (!userId) {
      return this.sendUnauthorized(res);
    }

    const orderId = this.validateId(req, res);
    if (orderId === null) return;

    await this.executeGrpcCall(
      req,
      res,
      "getOrder",
      { id: orderId },
      {
        transformer: (response) => ({ order: response.order }),
        successMessage: "Order fetched successfully",
        errorMessage: "Failed to fetch order",
        includeMetadata: true,
      }
    );
  };

  updateOrderStatus = async (req, res) => {
    const userId = this.getUserId(req);

    if (!userId) {
      return this.sendUnauthorized(res);
    }

    const orderId = this.validateId(req, res);
    if (orderId === null) return;

    const { status } = req.body;

    if (!status) {
      return this.sendValidationError(res, {
        status: "Status is required",
      });
    }

    await this.executeGrpcCall(
      req,
      res,
      "updateOrderStatus",
      { id: orderId, status },
      {
        transformer: (response) => ({ order: response.order }),
        successMessage: (response) =>
          response.message || "Order status updated successfully",
        errorMessage: "Failed to update order status",
        includeMetadata: true,
      }
    );
  };
}

export default new OrderController();
