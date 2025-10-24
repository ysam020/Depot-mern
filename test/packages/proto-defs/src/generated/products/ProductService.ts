// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/product.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateProductRequest as _products_CreateProductRequest, CreateProductRequest__Output as _products_CreateProductRequest__Output } from '../products/CreateProductRequest';
import type { CreateProductResponse as _products_CreateProductResponse, CreateProductResponse__Output as _products_CreateProductResponse__Output } from '../products/CreateProductResponse';
import type { GetProductRequest as _products_GetProductRequest, GetProductRequest__Output as _products_GetProductRequest__Output } from '../products/GetProductRequest';
import type { GetProductResponse as _products_GetProductResponse, GetProductResponse__Output as _products_GetProductResponse__Output } from '../products/GetProductResponse';
import type { ListProductsRequest as _products_ListProductsRequest, ListProductsRequest__Output as _products_ListProductsRequest__Output } from '../products/ListProductsRequest';
import type { ListProductsResponse as _products_ListProductsResponse, ListProductsResponse__Output as _products_ListProductsResponse__Output } from '../products/ListProductsResponse';

export interface ProductServiceClient extends grpc.Client {
  CreateProduct(argument: _products_CreateProductRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  CreateProduct(argument: _products_CreateProductRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  CreateProduct(argument: _products_CreateProductRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  CreateProduct(argument: _products_CreateProductRequest, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  createProduct(argument: _products_CreateProductRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  createProduct(argument: _products_CreateProductRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  createProduct(argument: _products_CreateProductRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  createProduct(argument: _products_CreateProductRequest, callback: grpc.requestCallback<_products_CreateProductResponse__Output>): grpc.ClientUnaryCall;
  
  GetProduct(argument: _products_GetProductRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  GetProduct(argument: _products_GetProductRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  GetProduct(argument: _products_GetProductRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  GetProduct(argument: _products_GetProductRequest, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  getProduct(argument: _products_GetProductRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  getProduct(argument: _products_GetProductRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  getProduct(argument: _products_GetProductRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  getProduct(argument: _products_GetProductRequest, callback: grpc.requestCallback<_products_GetProductResponse__Output>): grpc.ClientUnaryCall;
  
  ListProducts(argument: _products_ListProductsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  ListProducts(argument: _products_ListProductsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  ListProducts(argument: _products_ListProductsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  ListProducts(argument: _products_ListProductsRequest, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  listProducts(argument: _products_ListProductsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  listProducts(argument: _products_ListProductsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  listProducts(argument: _products_ListProductsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  listProducts(argument: _products_ListProductsRequest, callback: grpc.requestCallback<_products_ListProductsResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface ProductServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateProduct: grpc.handleUnaryCall<_products_CreateProductRequest__Output, _products_CreateProductResponse>;
  
  GetProduct: grpc.handleUnaryCall<_products_GetProductRequest__Output, _products_GetProductResponse>;
  
  ListProducts: grpc.handleUnaryCall<_products_ListProductsRequest__Output, _products_ListProductsResponse>;
  
}

export interface ProductServiceDefinition extends grpc.ServiceDefinition {
  CreateProduct: MethodDefinition<_products_CreateProductRequest, _products_CreateProductResponse, _products_CreateProductRequest__Output, _products_CreateProductResponse__Output>
  GetProduct: MethodDefinition<_products_GetProductRequest, _products_GetProductResponse, _products_GetProductRequest__Output, _products_GetProductResponse__Output>
  ListProducts: MethodDefinition<_products_ListProductsRequest, _products_ListProductsResponse, _products_ListProductsRequest__Output, _products_ListProductsResponse__Output>
}
