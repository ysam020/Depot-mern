// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/order.proto

import type { Order as _orders_Order, Order__Output as _orders_Order__Output } from '../orders/Order';

export interface UpdateOrderStatusResponse {
  'order'?: (_orders_Order | null);
  'success'?: (boolean);
  'message'?: (string);
}

export interface UpdateOrderStatusResponse__Output {
  'order': (_orders_Order__Output | null);
  'success': (boolean);
  'message': (string);
}
