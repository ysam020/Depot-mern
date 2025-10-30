import { ListOrdersByUserResponse } from "@depot/proto-defs/order";
import { MessageMapper } from "@depot/shared";

export async function listOrdersByUserHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    // Find all user orders
    const orders = await controller.findUserOrders(userId);

    const formattedOrders = MessageMapper.mapOrders(orders);

    controller.sendSuccess(callback, ListOrdersByUserResponse, {
      orders: formattedOrders,
    });
  });
}
