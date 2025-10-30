import { GetProductResponse } from "@depot/proto-defs/product";

export async function getProductHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { id } = call.request;

    const product = await controller.findByIdOrFail(callback, id);
    if (!product) return;

    controller.sendSuccess(callback, GetProductResponse, { product });
  });
}
