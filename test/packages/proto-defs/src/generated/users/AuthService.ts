// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/user.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { RefreshTokenRequest as _users_RefreshTokenRequest, RefreshTokenRequest__Output as _users_RefreshTokenRequest__Output } from '../users/RefreshTokenRequest';
import type { RefreshTokenResponse as _users_RefreshTokenResponse, RefreshTokenResponse__Output as _users_RefreshTokenResponse__Output } from '../users/RefreshTokenResponse';
import type { SigninRequest as _users_SigninRequest, SigninRequest__Output as _users_SigninRequest__Output } from '../users/SigninRequest';
import type { SigninResponse as _users_SigninResponse, SigninResponse__Output as _users_SigninResponse__Output } from '../users/SigninResponse';
import type { SignupRequest as _users_SignupRequest, SignupRequest__Output as _users_SignupRequest__Output } from '../users/SignupRequest';
import type { SignupResponse as _users_SignupResponse, SignupResponse__Output as _users_SignupResponse__Output } from '../users/SignupResponse';

export interface AuthServiceClient extends grpc.Client {
  RefreshToken(argument: _users_RefreshTokenRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  RefreshToken(argument: _users_RefreshTokenRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  RefreshToken(argument: _users_RefreshTokenRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  RefreshToken(argument: _users_RefreshTokenRequest, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  refreshToken(argument: _users_RefreshTokenRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  refreshToken(argument: _users_RefreshTokenRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  refreshToken(argument: _users_RefreshTokenRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  refreshToken(argument: _users_RefreshTokenRequest, callback: grpc.requestCallback<_users_RefreshTokenResponse__Output>): grpc.ClientUnaryCall;
  
  Signin(argument: _users_SigninRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  Signin(argument: _users_SigninRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  Signin(argument: _users_SigninRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  Signin(argument: _users_SigninRequest, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  signin(argument: _users_SigninRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  signin(argument: _users_SigninRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  signin(argument: _users_SigninRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  signin(argument: _users_SigninRequest, callback: grpc.requestCallback<_users_SigninResponse__Output>): grpc.ClientUnaryCall;
  
  Signup(argument: _users_SignupRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  Signup(argument: _users_SignupRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  Signup(argument: _users_SignupRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  Signup(argument: _users_SignupRequest, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  signup(argument: _users_SignupRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  signup(argument: _users_SignupRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  signup(argument: _users_SignupRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  signup(argument: _users_SignupRequest, callback: grpc.requestCallback<_users_SignupResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface AuthServiceHandlers extends grpc.UntypedServiceImplementation {
  RefreshToken: grpc.handleUnaryCall<_users_RefreshTokenRequest__Output, _users_RefreshTokenResponse>;
  
  Signin: grpc.handleUnaryCall<_users_SigninRequest__Output, _users_SigninResponse>;
  
  Signup: grpc.handleUnaryCall<_users_SignupRequest__Output, _users_SignupResponse>;
  
}

export interface AuthServiceDefinition extends grpc.ServiceDefinition {
  RefreshToken: MethodDefinition<_users_RefreshTokenRequest, _users_RefreshTokenResponse, _users_RefreshTokenRequest__Output, _users_RefreshTokenResponse__Output>
  Signin: MethodDefinition<_users_SigninRequest, _users_SigninResponse, _users_SigninRequest__Output, _users_SigninResponse__Output>
  Signup: MethodDefinition<_users_SignupRequest, _users_SignupResponse, _users_SignupRequest__Output, _users_SignupResponse__Output>
}
