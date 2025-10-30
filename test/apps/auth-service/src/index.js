import { AuthServiceService } from "@depot/proto-defs/user";
import { BaseGrpcService } from "@depot/grpc-utils";
import AuthController from "./controllers/index.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const authController = new AuthController();

class AuthService {
  static async signup(call, callback) {
    await authController.signup(call, callback);
  }

  static async signin(call, callback) {
    await authController.signin(call, callback);
  }

  static async refreshToken(call, callback) {
    await authController.refreshToken(call, callback);
  }
}

const authService = BaseGrpcService.createService(
  "AuthService",
  AuthServiceService,
  AuthService,
  { port: process.env.AUTH_SERVICE_PORT }
);

// Start the server
authService.start().catch((err) => {
  console.error("Failed to start AuthService:", err);
  process.exit(1);
});
