import { VerifyPaymentResponse } from "@depot/proto-defs/payment";
import { MessageMapper } from "@depot/shared";

export async function verifyPaymentHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      user_id,
      cart_items,
      shipping_address,
    } = call.request;

    // Step 1: Verify signature
    if (
      !controller.verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      controller.logError("Signature verification failed");
      return controller.sendError(
        callback,
        controller.grpc.status.INVALID_ARGUMENT,
        "Invalid payment signature"
      );
    }

    // Step 2: Fetch payment details from Razorpay
    const razorpayPaymentDetails =
      await controller.fetchRazorpayPayment(razorpay_payment_id);

    // Step 3: Verify payment status
    if (razorpayPaymentDetails.status !== "captured") {
      controller.logError(
        `Payment not captured: ${razorpayPaymentDetails.status}`
      );
      return controller.sendError(
        callback,
        controller.grpc.status.FAILED_PRECONDITION,
        `Payment not captured. Status: ${razorpayPaymentDetails.status}`
      );
    }

    // Step 4: Save payment to database
    const payment = await controller.savePayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      razorpayPaymentDetails.currency || "INR",
      razorpayPaymentDetails.method || "unknown",
      user_id
    );

    // Step 5: Prepare order items
    const orderItems = controller.prepareOrderItems(cart_items);

    // Step 6: Create order via Order Service
    const orderResponse = await controller.createOrderViaOrderService(
      user_id,
      orderItems,
      amount,
      payment.id,
      shipping_address,
      call.metadata
    );

    if (!orderResponse) {
      return controller.sendError(
        callback,
        controller.grpc.status.INTERNAL,
        "Failed to create order"
      );
    }

    // Step 7: Update payment with order_id
    await controller.linkPaymentToOrder(payment.id, orderResponse.order.id);

    // Step 8: Clear user's cart
    await controller.clearUserCart(user_id);

    // Step 9: Send final response
    const mappedPayment = MessageMapper.mapPayment(
      payment,
      orderResponse.order.id
    );

    controller.sendSuccess(callback, VerifyPaymentResponse, {
      success: true,
      message: "Payment verified and order created successfully",
      payment: mappedPayment,
      order: orderResponse.order,
    });
  });
}
