import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { OrderServiceClient as _orders_OrderServiceClient, OrderServiceDefinition as _orders_OrderServiceDefinition } from './orders/OrderService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Timestamp: MessageTypeDefinition
    }
  }
  orders: {
    CreateOrderRequest: MessageTypeDefinition
    CreateOrderResponse: MessageTypeDefinition
    GetOrderRequest: MessageTypeDefinition
    GetOrderResponse: MessageTypeDefinition
    ListOrdersByUserRequest: MessageTypeDefinition
    ListOrdersByUserResponse: MessageTypeDefinition
    Order: MessageTypeDefinition
    OrderItem: MessageTypeDefinition
    OrderService: SubtypeConstructor<typeof grpc.Client, _orders_OrderServiceClient> & { service: _orders_OrderServiceDefinition }
    UpdateOrderStatusRequest: MessageTypeDefinition
    UpdateOrderStatusResponse: MessageTypeDefinition
  }
}

