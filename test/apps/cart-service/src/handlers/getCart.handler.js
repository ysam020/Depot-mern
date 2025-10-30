import { GetCartResponse } from "@depot/proto-defs/cart";
import { MessageMapper } from "@depot/shared";

export async function getCartHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    // Fetch cart with items
    const cart = await controller.getCartWithItems(userId);

    const carts =
      cart?.cart_items.map((item) =>
        MessageMapper.mapCartItem(item, controller.CartMessage)
      ) || [];

    controller.sendSuccess(callback, GetCartResponse, { carts });
  });
}
