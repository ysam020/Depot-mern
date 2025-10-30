import { GetCartResponse } from "@depot/proto-defs/cart";

export async function clearCartHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    // Find user's cart
    const cart = await controller.findUserCart(userId);
    if (!cart) {
      return controller.sendError(
        callback,
        controller.grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    // Delete all cart items
    await controller.clearCartItems(cart.id);

    controller.sendSuccess(callback, GetCartResponse, { carts: [] });
  });
}
