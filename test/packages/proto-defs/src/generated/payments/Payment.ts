// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/payment.proto


export interface Payment {
  'id'?: (string);
  'order_id'?: (number);
  'razorpay_order_id'?: (string);
  'razorpay_payment_id'?: (string);
  'razorpay_signature'?: (string);
  'amount'?: (number);
  'currency'?: (string);
  'status'?: (string);
  'payment_method'?: (string);
  'user_id'?: (number);
}

export interface Payment__Output {
  'id': (string);
  'order_id': (number);
  'razorpay_order_id': (string);
  'razorpay_payment_id': (string);
  'razorpay_signature': (string);
  'amount': (number);
  'currency': (string);
  'status': (string);
  'payment_method': (string);
  'user_id': (number);
}
