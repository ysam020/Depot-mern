import { CreateOrderResponse } from "@depot/proto-defs/payment";

export async function createOrderHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { amount, currency, receipt } = call.request;

    // Validate amount
    if (!amount || amount <= 0) {
      controller.logError("Amount validation failed:", amount);
      return controller.sendError(
        callback,
        controller.grpc.status.INVALID_ARGUMENT,
        "Amount must be greater than 0"
      );
    }

    // Create Razorpay order
    const razorpayOrder = await controller.createRazorpayOrder(
      amount,
      currency || "INR",
      receipt || `receipt_${Date.now()}`
    );

    controller.sendSuccess(callback, CreateOrderResponse, {
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: controller.razorpayKeyId,
    });
  });
}
