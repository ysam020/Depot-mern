import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { PaymentServiceClient as _payments_PaymentServiceClient, PaymentServiceDefinition as _payments_PaymentServiceDefinition } from './payments/PaymentService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  payments: {
    CartItem: MessageTypeDefinition
    CreateOrderRequest: MessageTypeDefinition
    CreateOrderResponse: MessageTypeDefinition
    Payment: MessageTypeDefinition
    PaymentService: SubtypeConstructor<typeof grpc.Client, _payments_PaymentServiceClient> & { service: _payments_PaymentServiceDefinition }
    ShippingAddress: MessageTypeDefinition
    VerifyPaymentRequest: MessageTypeDefinition
    VerifyPaymentResponse: MessageTypeDefinition
  }
}

