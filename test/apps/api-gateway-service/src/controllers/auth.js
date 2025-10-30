import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { AuthServiceClient } from "@depot/proto-defs/user";

class AuthController extends BaseController {
  constructor() {
    const authClient = grpcClientManager.getClient(
      "AUTH_SERVICE",
      AuthServiceClient
    );
    super(authClient);
  }

  signup = async (req, res) => {
    const payload = this.extractFields(req, ["name", "email", "password"]);

    await this.executeGrpcCall(req, res, "signup", payload, {
      transformer: (response) => ({ user: response.user }),
      successMessage: "User registered successfully",
      errorMessage: "Failed to register user",
      statusCode: 201,
    });
  };

  signin = async (req, res) => {
    const payload = this.extractFields(req, ["email", "password"]);

    await this.executeGrpcCall(req, res, "signin", payload, {
      transformer: (response) => ({
        user: this.sanitizeUser(response.user),
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }),
      successMessage: "Signed in successfully",
      errorMessage: "Failed to sign in",
    });
  };

  refreshToken = async (req, res) => {
    const payload = this.extractFields(req, ["refreshToken"]);

    await this.executeGrpcCall(req, res, "refreshToken", payload, {
      transformer: (response) => ({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }),
      successMessage: response.message || "Tokens refreshed successfully",
      errorMessage: "Failed to refresh token",
    });
  };

  logout = async (req, res) => {
    ResponseFormatter.success(res, null, "Logged out successfully");
  };
}

export default new AuthController();
