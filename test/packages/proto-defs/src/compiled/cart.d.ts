import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "carts";
export interface Cart {
    id: number;
    title: string;
    price: number;
    image: string;
    quantity: number;
}
export interface AddToCartRequest {
    id: number;
    quantity: number;
}
export interface AddToCartResponse {
    cart?: Cart | undefined;
}
export interface UpdateCartRequest {
    id: number;
    quantity: number;
}
export interface UpdateCartResponse {
    carts: Cart[];
}
export interface DeleteCartRequest {
    id: number;
}
export interface DeleteCartResponse {
    cart?: Cart | undefined;
}
export interface GetCartRequest {
}
export interface GetCartResponse {
    carts: Cart[];
}
export interface ClearCartRequest {
}
export interface ClearCartResponse {
    carts: Cart[];
}
export declare const Cart: MessageFns<Cart>;
export declare const AddToCartRequest: MessageFns<AddToCartRequest>;
export declare const AddToCartResponse: MessageFns<AddToCartResponse>;
export declare const UpdateCartRequest: MessageFns<UpdateCartRequest>;
export declare const UpdateCartResponse: MessageFns<UpdateCartResponse>;
export declare const DeleteCartRequest: MessageFns<DeleteCartRequest>;
export declare const DeleteCartResponse: MessageFns<DeleteCartResponse>;
export declare const GetCartRequest: MessageFns<GetCartRequest>;
export declare const GetCartResponse: MessageFns<GetCartResponse>;
export declare const ClearCartRequest: MessageFns<ClearCartRequest>;
export declare const ClearCartResponse: MessageFns<ClearCartResponse>;
export type CartServiceService = typeof CartServiceService;
export declare const CartServiceService: {
    readonly addToCart: {
        readonly path: "/carts.CartService/AddToCart";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: AddToCartRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => AddToCartRequest;
        readonly responseSerialize: (value: AddToCartResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => AddToCartResponse;
    };
    readonly updateCart: {
        readonly path: "/carts.CartService/UpdateCart";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: UpdateCartRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => UpdateCartRequest;
        readonly responseSerialize: (value: UpdateCartResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => UpdateCartResponse;
    };
    readonly deleteCart: {
        readonly path: "/carts.CartService/DeleteCart";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: DeleteCartRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => DeleteCartRequest;
        readonly responseSerialize: (value: DeleteCartResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => DeleteCartResponse;
    };
    readonly getCart: {
        readonly path: "/carts.CartService/GetCart";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetCartRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetCartRequest;
        readonly responseSerialize: (value: GetCartResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetCartResponse;
    };
    readonly clearCart: {
        readonly path: "/carts.CartService/ClearCart";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: ClearCartRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => ClearCartRequest;
        readonly responseSerialize: (value: ClearCartResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => ClearCartResponse;
    };
};
export interface CartServiceServer extends UntypedServiceImplementation {
    addToCart: handleUnaryCall<AddToCartRequest, AddToCartResponse>;
    updateCart: handleUnaryCall<UpdateCartRequest, UpdateCartResponse>;
    deleteCart: handleUnaryCall<DeleteCartRequest, DeleteCartResponse>;
    getCart: handleUnaryCall<GetCartRequest, GetCartResponse>;
    clearCart: handleUnaryCall<ClearCartRequest, ClearCartResponse>;
}
export interface CartServiceClient extends Client {
    addToCart(request: AddToCartRequest, callback: (error: ServiceError | null, response: AddToCartResponse) => void): ClientUnaryCall;
    addToCart(request: AddToCartRequest, metadata: Metadata, callback: (error: ServiceError | null, response: AddToCartResponse) => void): ClientUnaryCall;
    addToCart(request: AddToCartRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: AddToCartResponse) => void): ClientUnaryCall;
    updateCart(request: UpdateCartRequest, callback: (error: ServiceError | null, response: UpdateCartResponse) => void): ClientUnaryCall;
    updateCart(request: UpdateCartRequest, metadata: Metadata, callback: (error: ServiceError | null, response: UpdateCartResponse) => void): ClientUnaryCall;
    updateCart(request: UpdateCartRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: UpdateCartResponse) => void): ClientUnaryCall;
    deleteCart(request: DeleteCartRequest, callback: (error: ServiceError | null, response: DeleteCartResponse) => void): ClientUnaryCall;
    deleteCart(request: DeleteCartRequest, metadata: Metadata, callback: (error: ServiceError | null, response: DeleteCartResponse) => void): ClientUnaryCall;
    deleteCart(request: DeleteCartRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: DeleteCartResponse) => void): ClientUnaryCall;
    getCart(request: GetCartRequest, callback: (error: ServiceError | null, response: GetCartResponse) => void): ClientUnaryCall;
    getCart(request: GetCartRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetCartResponse) => void): ClientUnaryCall;
    getCart(request: GetCartRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetCartResponse) => void): ClientUnaryCall;
    clearCart(request: ClearCartRequest, callback: (error: ServiceError | null, response: ClearCartResponse) => void): ClientUnaryCall;
    clearCart(request: ClearCartRequest, metadata: Metadata, callback: (error: ServiceError | null, response: ClearCartResponse) => void): ClientUnaryCall;
    clearCart(request: ClearCartRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: ClearCartResponse) => void): ClientUnaryCall;
}
export declare const CartServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CartServiceClient;
    service: typeof CartServiceService;
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
//# sourceMappingURL=cart.d.ts.map