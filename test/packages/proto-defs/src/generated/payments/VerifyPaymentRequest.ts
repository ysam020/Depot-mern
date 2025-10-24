// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/payment.proto

import type { CartItem as _payments_CartItem, CartItem__Output as _payments_CartItem__Output } from '../payments/CartItem';
import type { ShippingAddress as _payments_ShippingAddress, ShippingAddress__Output as _payments_ShippingAddress__Output } from '../payments/ShippingAddress';

export interface VerifyPaymentRequest {
  'razorpay_order_id'?: (string);
  'razorpay_payment_id'?: (string);
  'razorpay_signature'?: (string);
  'amount'?: (number);
  'user_id'?: (number);
  'cart_items'?: (_payments_CartItem)[];
  'shipping_address'?: (_payments_ShippingAddress | null);
}

export interface VerifyPaymentRequest__Output {
  'razorpay_order_id': (string);
  'razorpay_payment_id': (string);
  'razorpay_signature': (string);
  'amount': (number);
  'user_id': (number);
  'cart_items': (_payments_CartItem__Output)[];
  'shipping_address': (_payments_ShippingAddress__Output | null);
}
