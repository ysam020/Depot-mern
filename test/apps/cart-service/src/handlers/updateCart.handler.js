import { UpdateCartResponse } from "@depot/proto-defs/cart";
import { MessageMapper } from "@depot/shared";

export async function updateCartHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id: productId, quantity } = call.request;

    // Find user's cart
    const cart = await controller.findUserCart(userId);
    if (!cart) {
      return controller.sendError(
        callback,
        controller.grpc.status.NOT_FOUND,
        "Cart not found"
      );
    }

    // Update cart item quantity
    await controller.updateCartItemQuantity(cart.id, productId, quantity);

    // Fetch updated cart with items
    const updatedCart = await controller.getCartWithItems(userId);

    const carts =
      updatedCart?.cart_items.map((item) =>
        MessageMapper.mapCartItem(item, controller.CartMessage)
      ) || [];

    controller.sendSuccess(callback, UpdateCartResponse, { carts });
  });
}
