// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/order.proto

import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from '../google/protobuf/Timestamp';
import type { OrderItem as _orders_OrderItem, OrderItem__Output as _orders_OrderItem__Output } from '../orders/OrderItem';

export interface Order {
  'id'?: (number);
  'user_id'?: (number);
  'total'?: (number | string);
  'status'?: (string);
  'created_at'?: (_google_protobuf_Timestamp | null);
  'order_items'?: (_orders_OrderItem)[];
  'payment_id'?: (number);
  'shipping_address'?: (string);
}

export interface Order__Output {
  'id': (number);
  'user_id': (number);
  'total': (number);
  'status': (string);
  'created_at': (_google_protobuf_Timestamp__Output | null);
  'order_items': (_orders_OrderItem__Output)[];
  'payment_id': (number);
  'shipping_address': (string);
}
