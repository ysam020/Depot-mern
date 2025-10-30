import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "users";
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}
export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}
export interface SignupResponse {
    user?: User | undefined;
}
export interface SigninRequest {
    email: string;
    password: string;
}
export interface SigninResponse {
    user?: User | undefined;
    accessToken: string;
    refreshToken: string;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    success: boolean;
    message: string;
}
export declare const User: MessageFns<User>;
export declare const SignupRequest: MessageFns<SignupRequest>;
export declare const SignupResponse: MessageFns<SignupResponse>;
export declare const SigninRequest: MessageFns<SigninRequest>;
export declare const SigninResponse: MessageFns<SigninResponse>;
export declare const RefreshTokenRequest: MessageFns<RefreshTokenRequest>;
export declare const RefreshTokenResponse: MessageFns<RefreshTokenResponse>;
export type AuthServiceService = typeof AuthServiceService;
export declare const AuthServiceService: {
    readonly signin: {
        readonly path: "/users.AuthService/Signin";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: SigninRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => SigninRequest;
        readonly responseSerialize: (value: SigninResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => SigninResponse;
    };
    readonly signup: {
        readonly path: "/users.AuthService/Signup";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: SignupRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => SignupRequest;
        readonly responseSerialize: (value: SignupResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => SignupResponse;
    };
    readonly refreshToken: {
        readonly path: "/users.AuthService/RefreshToken";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: RefreshTokenRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => RefreshTokenRequest;
        readonly responseSerialize: (value: RefreshTokenResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => RefreshTokenResponse;
    };
};
export interface AuthServiceServer extends UntypedServiceImplementation {
    signin: handleUnaryCall<SigninRequest, SigninResponse>;
    signup: handleUnaryCall<SignupRequest, SignupResponse>;
    refreshToken: handleUnaryCall<RefreshTokenRequest, RefreshTokenResponse>;
}
export interface AuthServiceClient extends Client {
    signin(request: SigninRequest, callback: (error: ServiceError | null, response: SigninResponse) => void): ClientUnaryCall;
    signin(request: SigninRequest, metadata: Metadata, callback: (error: ServiceError | null, response: SigninResponse) => void): ClientUnaryCall;
    signin(request: SigninRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: SigninResponse) => void): ClientUnaryCall;
    signup(request: SignupRequest, callback: (error: ServiceError | null, response: SignupResponse) => void): ClientUnaryCall;
    signup(request: SignupRequest, metadata: Metadata, callback: (error: ServiceError | null, response: SignupResponse) => void): ClientUnaryCall;
    signup(request: SignupRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: SignupResponse) => void): ClientUnaryCall;
    refreshToken(request: RefreshTokenRequest, callback: (error: ServiceError | null, response: RefreshTokenResponse) => void): ClientUnaryCall;
    refreshToken(request: RefreshTokenRequest, metadata: Metadata, callback: (error: ServiceError | null, response: RefreshTokenResponse) => void): ClientUnaryCall;
    refreshToken(request: RefreshTokenRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: RefreshTokenResponse) => void): ClientUnaryCall;
}
export declare const AuthServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): AuthServiceClient;
    service: typeof AuthServiceService;
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
//# sourceMappingURL=user.d.ts.map