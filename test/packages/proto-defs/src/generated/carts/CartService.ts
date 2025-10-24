// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/cart.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { AddToCartRequest as _carts_AddToCartRequest, AddToCartRequest__Output as _carts_AddToCartRequest__Output } from '../carts/AddToCartRequest';
import type { AddToCartResponse as _carts_AddToCartResponse, AddToCartResponse__Output as _carts_AddToCartResponse__Output } from '../carts/AddToCartResponse';
import type { ClearCartRequest as _carts_ClearCartRequest, ClearCartRequest__Output as _carts_ClearCartRequest__Output } from '../carts/ClearCartRequest';
import type { ClearCartResponse as _carts_ClearCartResponse, ClearCartResponse__Output as _carts_ClearCartResponse__Output } from '../carts/ClearCartResponse';
import type { DeleteCartRequest as _carts_DeleteCartRequest, DeleteCartRequest__Output as _carts_DeleteCartRequest__Output } from '../carts/DeleteCartRequest';
import type { DeleteCartResponse as _carts_DeleteCartResponse, DeleteCartResponse__Output as _carts_DeleteCartResponse__Output } from '../carts/DeleteCartResponse';
import type { GetCartRequest as _carts_GetCartRequest, GetCartRequest__Output as _carts_GetCartRequest__Output } from '../carts/GetCartRequest';
import type { GetCartResponse as _carts_GetCartResponse, GetCartResponse__Output as _carts_GetCartResponse__Output } from '../carts/GetCartResponse';
import type { UpdateCartRequest as _carts_UpdateCartRequest, UpdateCartRequest__Output as _carts_UpdateCartRequest__Output } from '../carts/UpdateCartRequest';
import type { UpdateCartResponse as _carts_UpdateCartResponse, UpdateCartResponse__Output as _carts_UpdateCartResponse__Output } from '../carts/UpdateCartResponse';

export interface CartServiceClient extends grpc.Client {
  AddToCart(argument: _carts_AddToCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  AddToCart(argument: _carts_AddToCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  AddToCart(argument: _carts_AddToCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  AddToCart(argument: _carts_AddToCartRequest, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  addToCart(argument: _carts_AddToCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  addToCart(argument: _carts_AddToCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  addToCart(argument: _carts_AddToCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  addToCart(argument: _carts_AddToCartRequest, callback: grpc.requestCallback<_carts_AddToCartResponse__Output>): grpc.ClientUnaryCall;
  
  ClearCart(argument: _carts_ClearCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  ClearCart(argument: _carts_ClearCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  ClearCart(argument: _carts_ClearCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  ClearCart(argument: _carts_ClearCartRequest, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  clearCart(argument: _carts_ClearCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  clearCart(argument: _carts_ClearCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  clearCart(argument: _carts_ClearCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  clearCart(argument: _carts_ClearCartRequest, callback: grpc.requestCallback<_carts_ClearCartResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteCart(argument: _carts_DeleteCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  DeleteCart(argument: _carts_DeleteCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  DeleteCart(argument: _carts_DeleteCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  DeleteCart(argument: _carts_DeleteCartRequest, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  deleteCart(argument: _carts_DeleteCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  deleteCart(argument: _carts_DeleteCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  deleteCart(argument: _carts_DeleteCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  deleteCart(argument: _carts_DeleteCartRequest, callback: grpc.requestCallback<_carts_DeleteCartResponse__Output>): grpc.ClientUnaryCall;
  
  GetCart(argument: _carts_GetCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  GetCart(argument: _carts_GetCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  GetCart(argument: _carts_GetCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  GetCart(argument: _carts_GetCartRequest, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  getCart(argument: _carts_GetCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  getCart(argument: _carts_GetCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  getCart(argument: _carts_GetCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  getCart(argument: _carts_GetCartRequest, callback: grpc.requestCallback<_carts_GetCartResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateCart(argument: _carts_UpdateCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  UpdateCart(argument: _carts_UpdateCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  UpdateCart(argument: _carts_UpdateCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  UpdateCart(argument: _carts_UpdateCartRequest, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  updateCart(argument: _carts_UpdateCartRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  updateCart(argument: _carts_UpdateCartRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  updateCart(argument: _carts_UpdateCartRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  updateCart(argument: _carts_UpdateCartRequest, callback: grpc.requestCallback<_carts_UpdateCartResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CartServiceHandlers extends grpc.UntypedServiceImplementation {
  AddToCart: grpc.handleUnaryCall<_carts_AddToCartRequest__Output, _carts_AddToCartResponse>;
  
  ClearCart: grpc.handleUnaryCall<_carts_ClearCartRequest__Output, _carts_ClearCartResponse>;
  
  DeleteCart: grpc.handleUnaryCall<_carts_DeleteCartRequest__Output, _carts_DeleteCartResponse>;
  
  GetCart: grpc.handleUnaryCall<_carts_GetCartRequest__Output, _carts_GetCartResponse>;
  
  UpdateCart: grpc.handleUnaryCall<_carts_UpdateCartRequest__Output, _carts_UpdateCartResponse>;
  
}

export interface CartServiceDefinition extends grpc.ServiceDefinition {
  AddToCart: MethodDefinition<_carts_AddToCartRequest, _carts_AddToCartResponse, _carts_AddToCartRequest__Output, _carts_AddToCartResponse__Output>
  ClearCart: MethodDefinition<_carts_ClearCartRequest, _carts_ClearCartResponse, _carts_ClearCartRequest__Output, _carts_ClearCartResponse__Output>
  DeleteCart: MethodDefinition<_carts_DeleteCartRequest, _carts_DeleteCartResponse, _carts_DeleteCartRequest__Output, _carts_DeleteCartResponse__Output>
  GetCart: MethodDefinition<_carts_GetCartRequest, _carts_GetCartResponse, _carts_GetCartRequest__Output, _carts_GetCartResponse__Output>
  UpdateCart: MethodDefinition<_carts_UpdateCartRequest, _carts_UpdateCartResponse, _carts_UpdateCartRequest__Output, _carts_UpdateCartResponse__Output>
}
