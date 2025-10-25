import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  AuthServiceService,
  SignupResponse,
  SigninResponse,
  RefreshTokenResponse,
} from "@depot/proto-defs/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

class AuthService {
  static async signup(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const { name, email, password } = call.request;

      // Validate and send
      if (
        BaseGrpcService.validateAndSendError(
          callback,
          { name, email, password },
          ["name", "email", "password"]
        )
      ) {
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.ALREADY_EXISTS,
          "User with this email already exists"
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password: _, ...safeUser } = user;

      callback(
        null,
        BaseGrpcService.successResponse(SignupResponse, { user: safeUser })
      );
    });
  }

  static async signin(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const { email, password } = call.request;

      // Validate and send error
      if (
        BaseGrpcService.validateAndSendError(callback, { email, password }, [
          "email",
          "password",
        ])
      ) {
        return;
      }

      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.NOT_FOUND,
          "User not found"
        );
      }

      // Verify password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "Invalid credentials"
        );
      }

      // Remove password from user object
      const { password: _, ...safeUser } = user;

      // Generate tokens
      const accessToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "7d",
      });

      callback(
        null,
        BaseGrpcService.successResponse(SigninResponse, {
          user: safeUser,
          accessToken,
          refreshToken,
        })
      );
    });
  }

  static async refreshToken(call, callback) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      const { refreshToken } = call.request;

      // Validate and send error
      if (
        BaseGrpcService.validateAndSendError(callback, { refreshToken }, [
          "refreshToken",
        ])
      ) {
        return;
      }

      // Verify the refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, JWT_SECRET);
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return BaseGrpcService.sendError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "Invalid or expired refresh token"
        );
      }

      // Verify user still exists in database
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return BaseGrpcService.sendError(
          callback,
          grpc.status.NOT_FOUND,
          "User not found"
        );
      }

      // Remove password from user object
      const { password, ...safeUser } = user;

      // Generate new tokens with fresh user data from database
      const newAccessToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "1h",
      });

      const newRefreshToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Cleaner response creation
      callback(
        null,
        BaseGrpcService.successResponse(RefreshTokenResponse, {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          success: true,
          message: "Tokens refreshed successfully",
        })
      );
    });
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
