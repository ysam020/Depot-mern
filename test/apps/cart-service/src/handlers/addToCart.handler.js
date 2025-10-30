import { AddToCartResponse } from "@depot/proto-defs/cart";
import { MessageMapper } from "@depot/shared";

export async function addToCartHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id: productId, quantity = 1 } = call.request;

    // Get or create cart
    const cart = await controller.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await controller.findCartItem(cart.id, productId);

    let cartItem;
    if (existingItem) {
      // Update existing item quantity
      cartItem = await controller.updateCartItem(
        existingItem.id,
        existingItem.quantity + quantity
      );
    } else {
      // Create new cart item
      cartItem = await controller.createCartItem(cart.id, productId, quantity);
    }

    controller.sendSuccess(callback, AddToCartResponse, {
      cart: MessageMapper.mapCartItem(cartItem, controller.CartMessage),
    });
  });
}
