// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/payment.proto

import type { Payment as _payments_Payment, Payment__Output as _payments_Payment__Output } from '../payments/Payment';

export interface VerifyPaymentResponse {
  'success'?: (boolean);
  'message'?: (string);
  'payment'?: (_payments_Payment | null);
}

export interface VerifyPaymentResponse__Output {
  'success': (boolean);
  'message': (string);
  'payment': (_payments_Payment__Output | null);
}
