import { UpdateOrderStatusResponse } from "@depot/proto-defs/order";
import { MessageMapper } from "@depot/shared";

export async function updateOrderStatusHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id, status } = call.request;

    // Validate status
    if (!controller.isValidStatus(status)) {
      return controller.sendError(
        callback,
        controller.grpc.status.INVALID_ARGUMENT,
        `Invalid status. Must be one of: ${controller.VALID_ORDER_STATUSES.join(", ")}`
      );
    }

    // Find order
    const order = await controller.findOrderWithItems(id, userId);

    if (!order) {
      return controller.sendError(
        callback,
        controller.grpc.status.NOT_FOUND,
        "Order not found"
      );
    }

    // Verify ownership
    if (!controller.verifyOwnership(callback, order.user_id, userId)) {
      return;
    }

    // Update status
    const updatedOrder = await controller.updateOrderStatus(id, status);

    const formattedOrder = MessageMapper.mapOrder(updatedOrder);

    controller.sendSuccess(callback, UpdateOrderStatusResponse, {
      order: formattedOrder,
      success: true,
      message: "Order status updated successfully",
    });
  });
}
