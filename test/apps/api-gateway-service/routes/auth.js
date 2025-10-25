import express from "express";
import { AuthServiceClient } from "@depot/proto-defs/user";
import {
  grpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
  RequestValidator,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const authClient = grpcClientManager.getClient(
  "AUTH_SERVICE",
  AuthServiceClient
);

// Signup with validation middleware
router.post(
  "/signup",
  RequestValidator.middleware(["name", "email", "password"]),
  (req, res) => {
    const { name, email, password } = req.body;

    authClient.signup(
      { name, email, password },
      GrpcErrorHandler.wrapCallback(
        res,
        (response) => {
          ResponseFormatter.created(
            res,
            { user: response.user },
            "User registered successfully"
          );
        },
        "Failed to register user"
      )
    );
  }
);

// Signin with validation middleware
router.post(
  "/signin",
  RequestValidator.middleware(["email", "password"]),
  (req, res) => {
    const { email, password } = req.body;

    authClient.signin(
      { email, password },
      GrpcErrorHandler.wrapCallback(
        res,
        (response) => {
          const { password: _, ...safeUser } = response.user;
          ResponseFormatter.success(
            res,
            {
              user: safeUser,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            "Signed in successfully"
          );
        },
        "Failed to sign in"
      )
    );
  }
);

// Refresh token with validation
router.post(
  "/refresh-token",
  RequestValidator.middleware(["refreshToken"]),
  (req, res) => {
    const { refreshToken } = req.body;

    authClient.refreshToken(
      { refreshToken },
      GrpcErrorHandler.wrapCallback(
        res,
        (response) => {
          ResponseFormatter.success(
            res,
            {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            response.message || "Tokens refreshed successfully"
          );
        },
        "Failed to refresh token"
      )
    );
  }
);

// Logout
router.post("/logout", (req, res) => {
  ResponseFormatter.success(res, null, "Logged out successfully");
});

export default router;
