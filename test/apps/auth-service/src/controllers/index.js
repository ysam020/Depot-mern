import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import {
  signupHandler,
  signinHandler,
  refreshTokenHandler,
} from "../handlers/index.js";

class AuthController extends BaseServiceController {
  constructor() {
    super(prisma.users);
  }

  async signup(call, callback) {
    await signupHandler(this, call, callback);
  }

  async signin(call, callback) {
    await signinHandler(this, call, callback);
  }

  async refreshToken(call, callback) {
    await refreshTokenHandler(this, call, callback);
  }
}

export default AuthController;
