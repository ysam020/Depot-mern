import { GetOrderResponse } from "@depot/proto-defs/order";
import { MessageMapper } from "@depot/shared";

export async function getOrderHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id } = call.request;

    // Find order with items
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

    const formattedOrder = MessageMapper.mapOrder(order);

    controller.sendSuccess(callback, GetOrderResponse, {
      order: formattedOrder,
    });
  });
}
