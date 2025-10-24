import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "orders";
/** Order item model */
export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    title: string;
    image: string;
}
/** Order model */
export interface Order {
    id: number;
    user_id: number;
    total: number;
    status: string;
    created_at?: Date | undefined;
    order_items: OrderItem[];
    payment_id: number;
    shipping_address: string;
}
/** Request to create an order */
export interface CreateOrderRequest {
    user_id: number;
    items: OrderItem[];
    total: number;
    payment_id: number;
    shipping_address: string;
}
/** Response after creating an order */
export interface CreateOrderResponse {
    order?: Order | undefined;
    success: boolean;
    message: string;
}
/** Request to get order by ID */
export interface GetOrderRequest {
    id: number;
}
/** Response containing an order */
export interface GetOrderResponse {
    order?: Order | undefined;
}
/** Request to list orders by user */
export interface ListOrdersByUserRequest {
    user_id: number;
}
/** Response containing multiple orders */
export interface ListOrdersByUserResponse {
    orders: Order[];
}
/** Request to update order status */
export interface UpdateOrderStatusRequest {
    id: number;
    status: string;
}
/** Response after updating order status */
export interface UpdateOrderStatusResponse {
    order?: Order | undefined;
    success: boolean;
    message: string;
}
export declare const OrderItem: MessageFns<OrderItem>;
export declare const Order: MessageFns<Order>;
export declare const CreateOrderRequest: MessageFns<CreateOrderRequest>;
export declare const CreateOrderResponse: MessageFns<CreateOrderResponse>;
export declare const GetOrderRequest: MessageFns<GetOrderRequest>;
export declare const GetOrderResponse: MessageFns<GetOrderResponse>;
export declare const ListOrdersByUserRequest: MessageFns<ListOrdersByUserRequest>;
export declare const ListOrdersByUserResponse: MessageFns<ListOrdersByUserResponse>;
export declare const UpdateOrderStatusRequest: MessageFns<UpdateOrderStatusRequest>;
export declare const UpdateOrderStatusResponse: MessageFns<UpdateOrderStatusResponse>;
/** Order Service definition */
export type OrderServiceService = typeof OrderServiceService;
export declare const OrderServiceService: {
    readonly createOrder: {
        readonly path: "/orders.OrderService/CreateOrder";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: CreateOrderRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => CreateOrderRequest;
        readonly responseSerialize: (value: CreateOrderResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => CreateOrderResponse;
    };
    readonly getOrder: {
        readonly path: "/orders.OrderService/GetOrder";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetOrderRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetOrderRequest;
        readonly responseSerialize: (value: GetOrderResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetOrderResponse;
    };
    readonly listOrdersByUser: {
        readonly path: "/orders.OrderService/ListOrdersByUser";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: ListOrdersByUserRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => ListOrdersByUserRequest;
        readonly responseSerialize: (value: ListOrdersByUserResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => ListOrdersByUserResponse;
    };
    readonly updateOrderStatus: {
        readonly path: "/orders.OrderService/UpdateOrderStatus";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: UpdateOrderStatusRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => UpdateOrderStatusRequest;
        readonly responseSerialize: (value: UpdateOrderStatusResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => UpdateOrderStatusResponse;
    };
};
export interface OrderServiceServer extends UntypedServiceImplementation {
    createOrder: handleUnaryCall<CreateOrderRequest, CreateOrderResponse>;
    getOrder: handleUnaryCall<GetOrderRequest, GetOrderResponse>;
    listOrdersByUser: handleUnaryCall<ListOrdersByUserRequest, ListOrdersByUserResponse>;
    updateOrderStatus: handleUnaryCall<UpdateOrderStatusRequest, UpdateOrderStatusResponse>;
}
export interface OrderServiceClient extends Client {
    createOrder(request: CreateOrderRequest, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    createOrder(request: CreateOrderRequest, metadata: Metadata, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    createOrder(request: CreateOrderRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    getOrder(request: GetOrderRequest, callback: (error: ServiceError | null, response: GetOrderResponse) => void): ClientUnaryCall;
    getOrder(request: GetOrderRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetOrderResponse) => void): ClientUnaryCall;
    getOrder(request: GetOrderRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetOrderResponse) => void): ClientUnaryCall;
    listOrdersByUser(request: ListOrdersByUserRequest, callback: (error: ServiceError | null, response: ListOrdersByUserResponse) => void): ClientUnaryCall;
    listOrdersByUser(request: ListOrdersByUserRequest, metadata: Metadata, callback: (error: ServiceError | null, response: ListOrdersByUserResponse) => void): ClientUnaryCall;
    listOrdersByUser(request: ListOrdersByUserRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: ListOrdersByUserResponse) => void): ClientUnaryCall;
    updateOrderStatus(request: UpdateOrderStatusRequest, callback: (error: ServiceError | null, response: UpdateOrderStatusResponse) => void): ClientUnaryCall;
    updateOrderStatus(request: UpdateOrderStatusRequest, metadata: Metadata, callback: (error: ServiceError | null, response: UpdateOrderStatusResponse) => void): ClientUnaryCall;
    updateOrderStatus(request: UpdateOrderStatusRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: UpdateOrderStatusResponse) => void): ClientUnaryCall;
}
export declare const OrderServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): OrderServiceClient;
    service: typeof OrderServiceService;
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
//# sourceMappingURL=order.d.ts.map