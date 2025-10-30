import { DeleteCartResponse } from "@depot/proto-defs/cart";

export async function deleteCartHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id: productId } = call.request;

    // Find user's cart
    const cart = await controller.findUserCart(userId);
    if (!cart) {
      return controller.sendError(
        callback,
        controller.grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    // Remove item from cart
    await controller.removeCartItem(cart.id, productId);

    controller.sendSuccess(callback, DeleteCartResponse, { cart: null });
  });
}
