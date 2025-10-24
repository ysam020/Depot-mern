import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { AuthServiceClient as _users_AuthServiceClient, AuthServiceDefinition as _users_AuthServiceDefinition } from './users/AuthService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  users: {
    AuthService: SubtypeConstructor<typeof grpc.Client, _users_AuthServiceClient> & { service: _users_AuthServiceDefinition }
    RefreshTokenRequest: MessageTypeDefinition
    RefreshTokenResponse: MessageTypeDefinition
    SigninRequest: MessageTypeDefinition
    SigninResponse: MessageTypeDefinition
    SignupRequest: MessageTypeDefinition
    SignupResponse: MessageTypeDefinition
    User: MessageTypeDefinition
  }
}

