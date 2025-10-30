import { GetWishlistResponse } from "@depot/proto-defs/wishlist";
import { MessageMapper } from "@depot/shared";

export async function getWishlistHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const userId = controller.getUserIdOrFail(call, callback);
    if (!userId) return;

    const userWishlists = await controller.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    const wishlists = userWishlists.map((item) =>
      MessageMapper.mapWishlistItem(item, controller.WishlistMessage)
    );

    controller.sendSuccess(callback, GetWishlistResponse, {
      wishlist: wishlists,
    });
  });
}
