import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { WishlistServiceClient as _wishlists_WishlistServiceClient, WishlistServiceDefinition as _wishlists_WishlistServiceDefinition } from './wishlists/WishlistService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  wishlists: {
    AddToWishlistRequest: MessageTypeDefinition
    AddToWishlistResponse: MessageTypeDefinition
    GetWishlistRequest: MessageTypeDefinition
    GetWishlistResponse: MessageTypeDefinition
    RemoveFromWishlistRequest: MessageTypeDefinition
    RemoveFromWishlistResponse: MessageTypeDefinition
    Wishlist: MessageTypeDefinition
    WishlistService: SubtypeConstructor<typeof grpc.Client, _wishlists_WishlistServiceClient> & { service: _wishlists_WishlistServiceDefinition }
  }
}

