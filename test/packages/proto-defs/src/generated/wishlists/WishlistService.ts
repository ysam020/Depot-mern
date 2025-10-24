// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/wishlist.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { AddToWishlistRequest as _wishlists_AddToWishlistRequest, AddToWishlistRequest__Output as _wishlists_AddToWishlistRequest__Output } from '../wishlists/AddToWishlistRequest';
import type { AddToWishlistResponse as _wishlists_AddToWishlistResponse, AddToWishlistResponse__Output as _wishlists_AddToWishlistResponse__Output } from '../wishlists/AddToWishlistResponse';
import type { GetWishlistRequest as _wishlists_GetWishlistRequest, GetWishlistRequest__Output as _wishlists_GetWishlistRequest__Output } from '../wishlists/GetWishlistRequest';
import type { GetWishlistResponse as _wishlists_GetWishlistResponse, GetWishlistResponse__Output as _wishlists_GetWishlistResponse__Output } from '../wishlists/GetWishlistResponse';
import type { RemoveFromWishlistRequest as _wishlists_RemoveFromWishlistRequest, RemoveFromWishlistRequest__Output as _wishlists_RemoveFromWishlistRequest__Output } from '../wishlists/RemoveFromWishlistRequest';
import type { RemoveFromWishlistResponse as _wishlists_RemoveFromWishlistResponse, RemoveFromWishlistResponse__Output as _wishlists_RemoveFromWishlistResponse__Output } from '../wishlists/RemoveFromWishlistResponse';

export interface WishlistServiceClient extends grpc.Client {
  AddToWishlist(argument: _wishlists_AddToWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  AddToWishlist(argument: _wishlists_AddToWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  AddToWishlist(argument: _wishlists_AddToWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  AddToWishlist(argument: _wishlists_AddToWishlistRequest, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  addToWishlist(argument: _wishlists_AddToWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  addToWishlist(argument: _wishlists_AddToWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  addToWishlist(argument: _wishlists_AddToWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  addToWishlist(argument: _wishlists_AddToWishlistRequest, callback: grpc.requestCallback<_wishlists_AddToWishlistResponse__Output>): grpc.ClientUnaryCall;
  
  GetWishlist(argument: _wishlists_GetWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  GetWishlist(argument: _wishlists_GetWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  GetWishlist(argument: _wishlists_GetWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  GetWishlist(argument: _wishlists_GetWishlistRequest, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  getWishlist(argument: _wishlists_GetWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  getWishlist(argument: _wishlists_GetWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  getWishlist(argument: _wishlists_GetWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  getWishlist(argument: _wishlists_GetWishlistRequest, callback: grpc.requestCallback<_wishlists_GetWishlistResponse__Output>): grpc.ClientUnaryCall;
  
  RemoveFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  RemoveFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  RemoveFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  RemoveFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  removeFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  removeFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  removeFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  removeFromWishlist(argument: _wishlists_RemoveFromWishlistRequest, callback: grpc.requestCallback<_wishlists_RemoveFromWishlistResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface WishlistServiceHandlers extends grpc.UntypedServiceImplementation {
  AddToWishlist: grpc.handleUnaryCall<_wishlists_AddToWishlistRequest__Output, _wishlists_AddToWishlistResponse>;
  
  GetWishlist: grpc.handleUnaryCall<_wishlists_GetWishlistRequest__Output, _wishlists_GetWishlistResponse>;
  
  RemoveFromWishlist: grpc.handleUnaryCall<_wishlists_RemoveFromWishlistRequest__Output, _wishlists_RemoveFromWishlistResponse>;
  
}

export interface WishlistServiceDefinition extends grpc.ServiceDefinition {
  AddToWishlist: MethodDefinition<_wishlists_AddToWishlistRequest, _wishlists_AddToWishlistResponse, _wishlists_AddToWishlistRequest__Output, _wishlists_AddToWishlistResponse__Output>
  GetWishlist: MethodDefinition<_wishlists_GetWishlistRequest, _wishlists_GetWishlistResponse, _wishlists_GetWishlistRequest__Output, _wishlists_GetWishlistResponse__Output>
  RemoveFromWishlist: MethodDefinition<_wishlists_RemoveFromWishlistRequest, _wishlists_RemoveFromWishlistResponse, _wishlists_RemoveFromWishlistRequest__Output, _wishlists_RemoveFromWishlistResponse__Output>
}
