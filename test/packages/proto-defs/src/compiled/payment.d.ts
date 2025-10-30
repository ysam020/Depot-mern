import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "payments";
export interface Payment {
    id: string;
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    user_id: number;
}
export interface CreateOrderRequest {
    amount: number;
    currency: string;
    receipt: string;
}
export interface CreateOrderResponse {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key_id: string;
}
export interface CartItem {
    id: number;
    title: string;
    price: number;
    image: string;
    quantity: number;
}
export interface ShippingAddress {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
}
export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    user_id: number;
    cart_items: CartItem[];
    shipping_address?: ShippingAddress | undefined;
}
export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    payment?: Payment | undefined;
}
export declare const Payment: MessageFns<Payment>;
export declare const CreateOrderRequest: MessageFns<CreateOrderRequest>;
export declare const CreateOrderResponse: MessageFns<CreateOrderResponse>;
export declare const CartItem: MessageFns<CartItem>;
export declare const ShippingAddress: MessageFns<ShippingAddress>;
export declare const VerifyPaymentRequest: MessageFns<VerifyPaymentRequest>;
export declare const VerifyPaymentResponse: MessageFns<VerifyPaymentResponse>;
export type PaymentServiceService = typeof PaymentServiceService;
export declare const PaymentServiceService: {
    readonly createOrder: {
        readonly path: "/payments.PaymentService/CreateOrder";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: CreateOrderRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => CreateOrderRequest;
        readonly responseSerialize: (value: CreateOrderResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => CreateOrderResponse;
    };
    readonly verifyPayment: {
        readonly path: "/payments.PaymentService/VerifyPayment";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: VerifyPaymentRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => VerifyPaymentRequest;
        readonly responseSerialize: (value: VerifyPaymentResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => VerifyPaymentResponse;
    };
};
export interface PaymentServiceServer extends UntypedServiceImplementation {
    createOrder: handleUnaryCall<CreateOrderRequest, CreateOrderResponse>;
    verifyPayment: handleUnaryCall<VerifyPaymentRequest, VerifyPaymentResponse>;
}
export interface PaymentServiceClient extends Client {
    createOrder(request: CreateOrderRequest, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    createOrder(request: CreateOrderRequest, metadata: Metadata, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    createOrder(request: CreateOrderRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: CreateOrderResponse) => void): ClientUnaryCall;
    verifyPayment(request: VerifyPaymentRequest, callback: (error: ServiceError | null, response: VerifyPaymentResponse) => void): ClientUnaryCall;
    verifyPayment(request: VerifyPaymentRequest, metadata: Metadata, callback: (error: ServiceError | null, response: VerifyPaymentResponse) => void): ClientUnaryCall;
    verifyPayment(request: VerifyPaymentRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: VerifyPaymentResponse) => void): ClientUnaryCall;
}
export declare const PaymentServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PaymentServiceClient;
    service: typeof PaymentServiceService;
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
//# sourceMappingURL=payment.d.ts.map