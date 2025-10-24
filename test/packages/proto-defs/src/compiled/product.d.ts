import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "products";
/** Product model */
export interface Product {
    id: number;
    title: string;
    price: number;
    short_description: string;
    description: string;
    category: string;
    tags: string[];
    sku: string;
    weight: string;
    dimensions: string;
    color: string;
    material: string;
    image: string;
    rating: number;
    qty: number;
}
/** Request to get a product by ID */
export interface GetProductRequest {
    id: number;
}
/** Response containing a product */
export interface GetProductResponse {
    product?: Product | undefined;
}
/** Request to create a new product */
export interface CreateProductRequest {
    title: string;
    price: number;
    short_description: string;
    description: string;
    category: string;
    tags: string[];
    sku: string;
    weight: string;
    dimensions: string;
    color: string;
    material: string;
    image: string;
    rating: number;
    qty: number;
}
/** Response after creating a product */
export interface CreateProductResponse {
    product?: Product | undefined;
}
/** Request to list products */
export interface ListProductsRequest {
    limit: number;
    offset: number;
}
/** Response containing multiple products */
export interface ListProductsResponse {
    products: Product[];
}
export declare const Product: MessageFns<Product>;
export declare const GetProductRequest: MessageFns<GetProductRequest>;
export declare const GetProductResponse: MessageFns<GetProductResponse>;
export declare const CreateProductRequest: MessageFns<CreateProductRequest>;
export declare const CreateProductResponse: MessageFns<CreateProductResponse>;
export declare const ListProductsRequest: MessageFns<ListProductsRequest>;
export declare const ListProductsResponse: MessageFns<ListProductsResponse>;
/** Product Service definition */
export type ProductServiceService = typeof ProductServiceService;
export declare const ProductServiceService: {
    readonly getProduct: {
        readonly path: "/products.ProductService/GetProduct";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetProductRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetProductRequest;
        readonly responseSerialize: (value: GetProductResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetProductResponse;
    };
    readonly createProduct: {
        readonly path: "/products.ProductService/CreateProduct";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: CreateProductRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => CreateProductRequest;
        readonly responseSerialize: (value: CreateProductResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => CreateProductResponse;
    };
    readonly listProducts: {
        readonly path: "/products.ProductService/ListProducts";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: ListProductsRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => ListProductsRequest;
        readonly responseSerialize: (value: ListProductsResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => ListProductsResponse;
    };
};
export interface ProductServiceServer extends UntypedServiceImplementation {
    getProduct: handleUnaryCall<GetProductRequest, GetProductResponse>;
    createProduct: handleUnaryCall<CreateProductRequest, CreateProductResponse>;
    listProducts: handleUnaryCall<ListProductsRequest, ListProductsResponse>;
}
export interface ProductServiceClient extends Client {
    getProduct(request: GetProductRequest, callback: (error: ServiceError | null, response: GetProductResponse) => void): ClientUnaryCall;
    getProduct(request: GetProductRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetProductResponse) => void): ClientUnaryCall;
    getProduct(request: GetProductRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetProductResponse) => void): ClientUnaryCall;
    createProduct(request: CreateProductRequest, callback: (error: ServiceError | null, response: CreateProductResponse) => void): ClientUnaryCall;
    createProduct(request: CreateProductRequest, metadata: Metadata, callback: (error: ServiceError | null, response: CreateProductResponse) => void): ClientUnaryCall;
    createProduct(request: CreateProductRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: CreateProductResponse) => void): ClientUnaryCall;
    listProducts(request: ListProductsRequest, callback: (error: ServiceError | null, response: ListProductsResponse) => void): ClientUnaryCall;
    listProducts(request: ListProductsRequest, metadata: Metadata, callback: (error: ServiceError | null, response: ListProductsResponse) => void): ClientUnaryCall;
    listProducts(request: ListProductsRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: ListProductsResponse) => void): ClientUnaryCall;
}
export declare const ProductServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): ProductServiceClient;
    service: typeof ProductServiceService;
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
//# sourceMappingURL=product.d.ts.map