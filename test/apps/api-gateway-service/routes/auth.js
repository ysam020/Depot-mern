import express from "express";
import { AuthServiceClient } from "../../../dist/user.js";
import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const router = express.Router();

const AUTH_SERVICE_ADDRESS =
  process.env.AUTH_SERVICE_ADDRESS || "localhost:50051";

// Initialize gRPC client for Auth Service
const authClient = new AuthServiceClient(
  AUTH_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Call gRPC auth service
    authClient.signup({ name, email, password }, (err, response) => {
      if (err) {
        console.error("Signup error:", err);

        // Map gRPC errors to HTTP status codes
        let statusCode = 500;
        if (err.code === grpc.status.ALREADY_EXISTS) {
          statusCode = 409;
        } else if (err.code === grpc.status.INVALID_ARGUMENT) {
          statusCode = 400;
        }

        return res.status(statusCode).json({
          success: false,
          message: err.message || "Failed to register user",
        });
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: response.user,
      });
    });
  } catch (error) {
    console.error("Signup route error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Call gRPC auth service
    authClient.signin({ email, password }, (err, response) => {
      if (err) {
        console.error("Signin error:", err);

        // Map gRPC errors to HTTP status codes
        let statusCode = 500;
        let message = "Failed to sign in";

        if (err.code === grpc.status.NOT_FOUND) {
          statusCode = 404;
          message = "User not found";
        } else if (err.code === grpc.status.UNAUTHENTICATED) {
          statusCode = 401;
          message = "Invalid credentials";
        } else if (err.code === grpc.status.INVALID_ARGUMENT) {
          statusCode = 400;
          message = err.message;
        }

        return res.status(statusCode).json({
          success: false,
          message: message,
        });
      }

      const { password, ...safeUser } = response.user;
      res.json({
        success: true,
        message: "Signed in successfully",
        user: safeUser,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    });
  } catch (error) {
    console.error("Signin route error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Call gRPC auth service
    authClient.refreshToken({ refreshToken }, (err, response) => {
      if (err) {
        console.error("Refresh token error:", err);

        // Map gRPC errors to HTTP status codes
        let statusCode = 500;
        let message = "Failed to refresh token";

        if (err.code === grpc.status.UNAUTHENTICATED) {
          statusCode = 403;
          message = "Invalid or expired refresh token";
        } else if (err.code === grpc.status.INVALID_ARGUMENT) {
          statusCode = 400;
          message = err.message;
        } else if (err.code === grpc.status.NOT_FOUND) {
          statusCode = 404;
          message = "User not found";
        }

        return res.status(statusCode).json({
          success: false,
          message: message,
        });
      }

      res.json({
        success: response.success,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        message: response.message,
      });
    });
  } catch (error) {
    console.error("Refresh token route error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
