import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "wishlists";
export interface Wishlist {
    id: number;
    title: string;
    price: number;
    image: string;
    quantity: number;
}
export interface AddToWishlistRequest {
    id: number;
}
export interface AddToWishlistResponse {
    wishlist: Wishlist[];
}
export interface RemoveFromWishlistRequest {
    id: number;
}
export interface RemoveFromWishlistResponse {
    wishlist: Wishlist[];
}
export interface GetWishlistRequest {
}
export interface GetWishlistResponse {
    wishlist: Wishlist[];
}
export declare const Wishlist: MessageFns<Wishlist>;
export declare const AddToWishlistRequest: MessageFns<AddToWishlistRequest>;
export declare const AddToWishlistResponse: MessageFns<AddToWishlistResponse>;
export declare const RemoveFromWishlistRequest: MessageFns<RemoveFromWishlistRequest>;
export declare const RemoveFromWishlistResponse: MessageFns<RemoveFromWishlistResponse>;
export declare const GetWishlistRequest: MessageFns<GetWishlistRequest>;
export declare const GetWishlistResponse: MessageFns<GetWishlistResponse>;
export type WishlistServiceService = typeof WishlistServiceService;
export declare const WishlistServiceService: {
    readonly addToWishlist: {
        readonly path: "/wishlists.WishlistService/AddToWishlist";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: AddToWishlistRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => AddToWishlistRequest;
        readonly responseSerialize: (value: AddToWishlistResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => AddToWishlistResponse;
    };
    readonly removeFromWishlist: {
        readonly path: "/wishlists.WishlistService/RemoveFromWishlist";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: RemoveFromWishlistRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => RemoveFromWishlistRequest;
        readonly responseSerialize: (value: RemoveFromWishlistResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => RemoveFromWishlistResponse;
    };
    readonly getWishlist: {
        readonly path: "/wishlists.WishlistService/GetWishlist";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetWishlistRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetWishlistRequest;
        readonly responseSerialize: (value: GetWishlistResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetWishlistResponse;
    };
};
export interface WishlistServiceServer extends UntypedServiceImplementation {
    addToWishlist: handleUnaryCall<AddToWishlistRequest, AddToWishlistResponse>;
    removeFromWishlist: handleUnaryCall<RemoveFromWishlistRequest, RemoveFromWishlistResponse>;
    getWishlist: handleUnaryCall<GetWishlistRequest, GetWishlistResponse>;
}
export interface WishlistServiceClient extends Client {
    addToWishlist(request: AddToWishlistRequest, callback: (error: ServiceError | null, response: AddToWishlistResponse) => void): ClientUnaryCall;
    addToWishlist(request: AddToWishlistRequest, metadata: Metadata, callback: (error: ServiceError | null, response: AddToWishlistResponse) => void): ClientUnaryCall;
    addToWishlist(request: AddToWishlistRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: AddToWishlistResponse) => void): ClientUnaryCall;
    removeFromWishlist(request: RemoveFromWishlistRequest, callback: (error: ServiceError | null, response: RemoveFromWishlistResponse) => void): ClientUnaryCall;
    removeFromWishlist(request: RemoveFromWishlistRequest, metadata: Metadata, callback: (error: ServiceError | null, response: RemoveFromWishlistResponse) => void): ClientUnaryCall;
    removeFromWishlist(request: RemoveFromWishlistRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: RemoveFromWishlistResponse) => void): ClientUnaryCall;
    getWishlist(request: GetWishlistRequest, callback: (error: ServiceError | null, response: GetWishlistResponse) => void): ClientUnaryCall;
    getWishlist(request: GetWishlistRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetWishlistResponse) => void): ClientUnaryCall;
    getWishlist(request: GetWishlistRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetWishlistResponse) => void): ClientUnaryCall;
}
export declare const WishlistServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): WishlistServiceClient;
    service: typeof WishlistServiceService;
    serviceName: string;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
//# sourceMappingURL=wishlist.d.ts.map