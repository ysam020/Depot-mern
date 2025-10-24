import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import {
  AuthServiceService,
  SignupResponse,
  SigninResponse,
  RefreshTokenResponse,
} from "../../dist/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { successResponse, errorResponse } from "@depot/grpc-utils";
import { BaseGrpcService } from "@depot/grpc-utils";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

class AuthService extends BaseGrpcService {
  constructor() {
    const serviceImpl = {
      signup: BaseGrpcService.wrapHandler(AuthService.signup),
      signin: BaseGrpcService.wrapHandler(AuthService.signin),
      refreshToken: BaseGrpcService.wrapHandler(AuthService.refreshToken),
    };

    super("AuthService", AuthServiceService, serviceImpl, {
      port: process.env.AUTH_SERVICE_PORT,
    });
  }

  static async signup(call, callback) {
    const { name, email, password } = call.request;

    // Validate input
    const validationError = BaseGrpcService.validateRequiredFields(
      { name, email, password },
      ["name", "email", "password"]
    );

    if (validationError) {
      return BaseGrpcService.sendError(
        callback,
        validationError.code,
        validationError.message
      );
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

    const response = successResponse(
      { user: safeUser },
      "User registered successfully"
    );
    callback(null, SignupResponse.fromPartial(response));
  }

  static async signin(call, callback) {
    const { email, password } = call.request;

    // Validate input
    const validationError = BaseGrpcService.validateRequiredFields(
      { email, password },
      ["email", "password"]
    );

    if (validationError) {
      return BaseGrpcService.sendError(
        callback,
        validationError.code,
        validationError.message
      );
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

    const response = successResponse(
      {
        user: safeUser,
        accessToken,
        refreshToken,
      },
      "Signed in successfully"
    );

    callback(null, SigninResponse.fromPartial(response.data));
  }

  static async refreshToken(call, callback) {
    const { refreshToken } = call.request;

    // Validate input
    const validationError = BaseGrpcService.validateRequiredFields(
      { refreshToken },
      ["refreshToken"]
    );

    if (validationError) {
      return BaseGrpcService.sendError(
        callback,
        validationError.code,
        validationError.message
      );
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
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

    // Remove password and JWT-specific fields
    const { password, ...safeUser } = user;

    // Generate new tokens with fresh user data from database
    const newAccessToken = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "1h",
    });

    const newRefreshToken = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = successResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      "Tokens refreshed successfully"
    );

    callback(
      null,
      RefreshTokenResponse.fromPartial({
        ...response.data,
        success: response.success,
        message: response.message,
      })
    );
  }
}

// Start the server
const authService = new AuthService();
authService.start().catch((err) => {
  console.error("Failed to start AuthService:", err);
  process.exit(1);
});
