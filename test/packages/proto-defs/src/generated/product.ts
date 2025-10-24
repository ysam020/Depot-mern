import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ProductServiceClient as _products_ProductServiceClient, ProductServiceDefinition as _products_ProductServiceDefinition } from './products/ProductService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Timestamp: MessageTypeDefinition
    }
  }
  products: {
    CreateProductRequest: MessageTypeDefinition
    CreateProductResponse: MessageTypeDefinition
    GetProductRequest: MessageTypeDefinition
    GetProductResponse: MessageTypeDefinition
    ListProductsRequest: MessageTypeDefinition
    ListProductsResponse: MessageTypeDefinition
    Product: MessageTypeDefinition
    ProductService: SubtypeConstructor<typeof grpc.Client, _products_ProductServiceClient> & { service: _products_ProductServiceDefinition }
  }
}

