import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CartServiceClient as _carts_CartServiceClient, CartServiceDefinition as _carts_CartServiceDefinition } from './carts/CartService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  carts: {
    AddToCartRequest: MessageTypeDefinition
    AddToCartResponse: MessageTypeDefinition
    Cart: MessageTypeDefinition
    CartService: SubtypeConstructor<typeof grpc.Client, _carts_CartServiceClient> & { service: _carts_CartServiceDefinition }
    ClearCartRequest: MessageTypeDefinition
    ClearCartResponse: MessageTypeDefinition
    DeleteCartRequest: MessageTypeDefinition
    DeleteCartResponse: MessageTypeDefinition
    GetCartRequest: MessageTypeDefinition
    GetCartResponse: MessageTypeDefinition
    UpdateCartRequest: MessageTypeDefinition
    UpdateCartResponse: MessageTypeDefinition
  }
}

