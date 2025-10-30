import { ListProductsResponse } from "@depot/proto-defs/product";

export async function listProductsHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { limit = 100, offset = 0 } = call.request;

    const products = await controller.findMany({
      take: limit,
      skip: offset,
      orderBy: { title: "asc" },
    });

    controller.sendSuccess(callback, ListProductsResponse, { products });
  });
}
