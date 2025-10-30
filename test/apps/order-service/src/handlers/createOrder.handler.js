import { CreateOrderResponse } from "@depot/proto-defs/order";
import { MessageMapper } from "@depot/shared";

export async function createOrderHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { items, total, payment_id, shipping_address } = call.request;

    // Validate items
    if (!items || items.length === 0) {
      return controller.sendError(
        callback,
        controller.grpc.status.INVALID_ARGUMENT,
        "Order must contain at least one item"
      );
    }

    // Create order in transaction
    const order = await controller.createOrderWithItems(
      userId,
      items,
      total,
      payment_id,
      shipping_address
    );

    if (!order) {
      return controller.sendError(
        callback,
        controller.grpc.status.INTERNAL,
        "Failed to create order"
      );
    }

    const formattedOrder = MessageMapper.mapOrder(order);

    controller.sendSuccess(callback, CreateOrderResponse, {
      order: formattedOrder,
      success: true,
      message: "Order created successfully",
    });
  });
}
