import { RemoveFromWishlistResponse } from "@depot/proto-defs/wishlist";
import { MessageMapper } from "@depot/shared";

export async function removeFromWishlistHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const { id: productId } = call.request;

    // Remove from wishlist
    await controller.delete({ user_id: userId, product_id: productId });

    // Fetch remaining items
    const userWishlists = await controller.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    const wishlists = userWishlists.map((item) =>
      MessageMapper.mapWishlistItem(item, controller.WishlistMessage)
    );

    controller.sendSuccess(callback, RemoveFromWishlistResponse, {
      wishlist: wishlists,
    });
  });
}
