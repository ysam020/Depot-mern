// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/order.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateOrderRequest as _orders_CreateOrderRequest, CreateOrderRequest__Output as _orders_CreateOrderRequest__Output } from '../orders/CreateOrderRequest';
import type { CreateOrderResponse as _orders_CreateOrderResponse, CreateOrderResponse__Output as _orders_CreateOrderResponse__Output } from '../orders/CreateOrderResponse';
import type { GetOrderRequest as _orders_GetOrderRequest, GetOrderRequest__Output as _orders_GetOrderRequest__Output } from '../orders/GetOrderRequest';
import type { GetOrderResponse as _orders_GetOrderResponse, GetOrderResponse__Output as _orders_GetOrderResponse__Output } from '../orders/GetOrderResponse';
import type { ListOrdersByUserRequest as _orders_ListOrdersByUserRequest, ListOrdersByUserRequest__Output as _orders_ListOrdersByUserRequest__Output } from '../orders/ListOrdersByUserRequest';
import type { ListOrdersByUserResponse as _orders_ListOrdersByUserResponse, ListOrdersByUserResponse__Output as _orders_ListOrdersByUserResponse__Output } from '../orders/ListOrdersByUserResponse';
import type { UpdateOrderStatusRequest as _orders_UpdateOrderStatusRequest, UpdateOrderStatusRequest__Output as _orders_UpdateOrderStatusRequest__Output } from '../orders/UpdateOrderStatusRequest';
import type { UpdateOrderStatusResponse as _orders_UpdateOrderStatusResponse, UpdateOrderStatusResponse__Output as _orders_UpdateOrderStatusResponse__Output } from '../orders/UpdateOrderStatusResponse';

export interface OrderServiceClient extends grpc.Client {
  CreateOrder(argument: _orders_CreateOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _orders_CreateOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _orders_CreateOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _orders_CreateOrderRequest, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _orders_CreateOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _orders_CreateOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _orders_CreateOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _orders_CreateOrderRequest, callback: grpc.requestCallback<_orders_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  
  GetOrder(argument: _orders_GetOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  GetOrder(argument: _orders_GetOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  GetOrder(argument: _orders_GetOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  GetOrder(argument: _orders_GetOrderRequest, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  getOrder(argument: _orders_GetOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  getOrder(argument: _orders_GetOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  getOrder(argument: _orders_GetOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  getOrder(argument: _orders_GetOrderRequest, callback: grpc.requestCallback<_orders_GetOrderResponse__Output>): grpc.ClientUnaryCall;
  
  ListOrdersByUser(argument: _orders_ListOrdersByUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  ListOrdersByUser(argument: _orders_ListOrdersByUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  ListOrdersByUser(argument: _orders_ListOrdersByUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  ListOrdersByUser(argument: _orders_ListOrdersByUserRequest, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  listOrdersByUser(argument: _orders_ListOrdersByUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  listOrdersByUser(argument: _orders_ListOrdersByUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  listOrdersByUser(argument: _orders_ListOrdersByUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  listOrdersByUser(argument: _orders_ListOrdersByUserRequest, callback: grpc.requestCallback<_orders_ListOrdersByUserResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateOrderStatus(argument: _orders_UpdateOrderStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  UpdateOrderStatus(argument: _orders_UpdateOrderStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  UpdateOrderStatus(argument: _orders_UpdateOrderStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  UpdateOrderStatus(argument: _orders_UpdateOrderStatusRequest, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  updateOrderStatus(argument: _orders_UpdateOrderStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  updateOrderStatus(argument: _orders_UpdateOrderStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  updateOrderStatus(argument: _orders_UpdateOrderStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  updateOrderStatus(argument: _orders_UpdateOrderStatusRequest, callback: grpc.requestCallback<_orders_UpdateOrderStatusResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface OrderServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateOrder: grpc.handleUnaryCall<_orders_CreateOrderRequest__Output, _orders_CreateOrderResponse>;
  
  GetOrder: grpc.handleUnaryCall<_orders_GetOrderRequest__Output, _orders_GetOrderResponse>;
  
  ListOrdersByUser: grpc.handleUnaryCall<_orders_ListOrdersByUserRequest__Output, _orders_ListOrdersByUserResponse>;
  
  UpdateOrderStatus: grpc.handleUnaryCall<_orders_UpdateOrderStatusRequest__Output, _orders_UpdateOrderStatusResponse>;
  
}

export interface OrderServiceDefinition extends grpc.ServiceDefinition {
  CreateOrder: MethodDefinition<_orders_CreateOrderRequest, _orders_CreateOrderResponse, _orders_CreateOrderRequest__Output, _orders_CreateOrderResponse__Output>
  GetOrder: MethodDefinition<_orders_GetOrderRequest, _orders_GetOrderResponse, _orders_GetOrderRequest__Output, _orders_GetOrderResponse__Output>
  ListOrdersByUser: MethodDefinition<_orders_ListOrdersByUserRequest, _orders_ListOrdersByUserResponse, _orders_ListOrdersByUserRequest__Output, _orders_ListOrdersByUserResponse__Output>
  UpdateOrderStatus: MethodDefinition<_orders_UpdateOrderStatusRequest, _orders_UpdateOrderStatusResponse, _orders_UpdateOrderStatusRequest__Output, _orders_UpdateOrderStatusResponse__Output>
}
