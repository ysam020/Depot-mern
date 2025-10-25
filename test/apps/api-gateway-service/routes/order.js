import express from "express";
import { OrderServiceClient } from "@depot/proto-defs/order";
import {
  grpcClientManager,
  GrpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
  authHelper,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const orderClient = grpcClientManager.getClient(
  "ORDER_SERVICE",
  OrderServiceClient
);

// Get all orders for logged-in user
router.get("/", (req, res) => {
  const userId = authHelper.getUserIdFromRequest(req);

  if (!userId) {
    return ResponseFormatter.unauthorized(res);
  }

  orderClient.listOrdersByUser(
    { user_id: userId },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { orders: response.orders || [] },
          "Orders fetched successfully"
        );
      },
      "Failed to fetch orders"
    )
  );
});

// Get single order by ID
router.get("/:id", (req, res) => {
  const userId = authHelper.getUserIdFromRequest(req);

  if (!userId) {
    return ResponseFormatter.unauthorized(res);
  }

  const orderId = parseInt(req.params.id);

  if (isNaN(orderId)) {
    return ResponseFormatter.validationError(res, { id: "Invalid order ID" });
  }

  orderClient.getOrder(
    { id: orderId },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { order: response.order },
          "Order fetched successfully"
        );
      },
      "Failed to fetch order"
    )
  );
});

// Update order status
router.patch("/:id/status", (req, res) => {
  const userId = authHelper.getUserIdFromRequest(req);

  if (!userId) {
    return ResponseFormatter.unauthorized(res);
  }

  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    return ResponseFormatter.validationError(res, {
      status: "Status is required",
    });
  }

  orderClient.updateOrderStatus(
    { id: orderId, status },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { order: response.order },
          response.message || "Order status updated successfully"
        );
      },
      "Failed to update order status"
    )
  );
});

export default router;
