// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/user.proto

import type { User as _users_User, User__Output as _users_User__Output } from '../users/User';

export interface SigninResponse {
  'user'?: (_users_User | null);
  'accessToken'?: (string);
  'refreshToken'?: (string);
}

export interface SigninResponse__Output {
  'user': (_users_User__Output | null);
  'accessToken': (string);
  'refreshToken': (string);
}
