import { AddToWishlistResponse } from "@depot/proto-defs/wishlist";
import { MessageMapper } from "@depot/shared";

export async function addToWishlistHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id: productId } = call.request;

    // Check if already exists
    const exists = await controller.checkExistsAndFail(
      callback,
      { user_id: userId, product_id: productId },
      "Product already in wishlist"
    );
    if (exists) return;

    // Add to wishlist
    const wishlistItem = await controller.create(
      { user_id: userId, product_id: productId },
      { include: { product: true } }
    );

    controller.sendSuccess(callback, AddToWishlistResponse, {
      wishlist: [
        MessageMapper.mapWishlistItem(wishlistItem, controller.WishlistMessage),
      ],
    });
  });
}
