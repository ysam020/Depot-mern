// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/payment.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateOrderRequest as _payments_CreateOrderRequest, CreateOrderRequest__Output as _payments_CreateOrderRequest__Output } from '../payments/CreateOrderRequest';
import type { CreateOrderResponse as _payments_CreateOrderResponse, CreateOrderResponse__Output as _payments_CreateOrderResponse__Output } from '../payments/CreateOrderResponse';
import type { VerifyPaymentRequest as _payments_VerifyPaymentRequest, VerifyPaymentRequest__Output as _payments_VerifyPaymentRequest__Output } from '../payments/VerifyPaymentRequest';
import type { VerifyPaymentResponse as _payments_VerifyPaymentResponse, VerifyPaymentResponse__Output as _payments_VerifyPaymentResponse__Output } from '../payments/VerifyPaymentResponse';

export interface PaymentServiceClient extends grpc.Client {
  CreateOrder(argument: _payments_CreateOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _payments_CreateOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _payments_CreateOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  CreateOrder(argument: _payments_CreateOrderRequest, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _payments_CreateOrderRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _payments_CreateOrderRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _payments_CreateOrderRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  createOrder(argument: _payments_CreateOrderRequest, callback: grpc.requestCallback<_payments_CreateOrderResponse__Output>): grpc.ClientUnaryCall;
  
  VerifyPayment(argument: _payments_VerifyPaymentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  VerifyPayment(argument: _payments_VerifyPaymentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  VerifyPayment(argument: _payments_VerifyPaymentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  VerifyPayment(argument: _payments_VerifyPaymentRequest, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  verifyPayment(argument: _payments_VerifyPaymentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  verifyPayment(argument: _payments_VerifyPaymentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  verifyPayment(argument: _payments_VerifyPaymentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  verifyPayment(argument: _payments_VerifyPaymentRequest, callback: grpc.requestCallback<_payments_VerifyPaymentResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface PaymentServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateOrder: grpc.handleUnaryCall<_payments_CreateOrderRequest__Output, _payments_CreateOrderResponse>;
  
  VerifyPayment: grpc.handleUnaryCall<_payments_VerifyPaymentRequest__Output, _payments_VerifyPaymentResponse>;
  
}

export interface PaymentServiceDefinition extends grpc.ServiceDefinition {
  CreateOrder: MethodDefinition<_payments_CreateOrderRequest, _payments_CreateOrderResponse, _payments_CreateOrderRequest__Output, _payments_CreateOrderResponse__Output>
  VerifyPayment: MethodDefinition<_payments_VerifyPaymentRequest, _payments_VerifyPaymentResponse, _payments_VerifyPaymentRequest__Output, _payments_VerifyPaymentResponse__Output>
}
