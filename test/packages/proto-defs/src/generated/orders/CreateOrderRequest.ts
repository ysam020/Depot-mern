// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/order.proto

import type { OrderItem as _orders_OrderItem, OrderItem__Output as _orders_OrderItem__Output } from '../orders/OrderItem';

export interface CreateOrderRequest {
  'user_id'?: (number);
  'items'?: (_orders_OrderItem)[];
  'total'?: (number | string);
  'payment_id'?: (number);
  'shipping_address'?: (string);
}

export interface CreateOrderRequest__Output {
  'user_id': (number);
  'items': (_orders_OrderItem__Output)[];
  'total': (number);
  'payment_id': (number);
  'shipping_address': (string);
}
