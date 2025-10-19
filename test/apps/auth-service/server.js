// import grpc from "@grpc/grpc-js";
// import prisma from "@depot/prisma"; // your Prisma client
// import {
//   AuthServiceService,
//   SignupResponse,
//   SigninResponse,
// } from "../../dist/user.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET;

// // Implement the service using Prisma
// const authServiceImpl = {
//   signup: async (call, callback) => {
//     try {
//       const hashedPassword = await bcrypt.hash(call.request.password, 10);
//       const user = await prisma.users.create({
//         data: {
//           name: call.request.name,
//           email: call.request.email,
//           password: hashedPassword,
//         },
//       });

//       callback(null, SignupResponse.fromPartial({ user }));
//     } catch (err) {
//       console.error("gRPC Error:", err);
//       callback({
//         code: grpc.status.INTERNAL,
//         message: err.message,
//       });
//     }
//   },

//   signin: async (call, callback) => {
//     try {
//       const user = await prisma.users.findUnique({
//         where: { email: call.request.email },
//       });

//       if (!user) {
//         return callback({
//           code: grpc.status.NOT_FOUND,
//           message: "User not found",
//         });
//       }

//       const isPasswordMatch = await bcrypt.compare(
//         call.request.password,
//         user.password
//       );
//       if (!isPasswordMatch) {
//         return callback({
//           code: grpc.status.UNAUTHENTICATED,
//           message: "Password didn't match",
//         });
//       }

//       const { password, ...safeUser } = user;

//       const accessToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });
//       const refreshToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });

//       callback(
//         null,
//         SigninResponse.fromPartial({
//           user: safeUser,
//           accessToken,
//           refreshToken,
//         })
//       );
//     } catch (err) {
//       console.error("gRPC Error:", err);
//       callback({
//         code: grpc.status.INTERNAL,
//         message: err.message,
//       });
//     }
//   },
// };

// function startServer() {
//   const server = new grpc.Server();
//   server.addService(AuthServiceService, authServiceImpl);

//   const PORT = process.env.AUTH_SERVICE_PORT;
//   server.bindAsync(
//     `0.0.0.0:${PORT}`,
//     grpc.ServerCredentials.createInsecure(),
//     (err, port) => {
//       if (err) throw err;
//       console.log(`🟢 AuthService running on port ${port}`);
//     }
//   );
// }

// startServer();

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

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Implement the auth service using Prisma
const authServiceImpl = {
  /**
   * SIGNUP - Register a new user
   */
  signup: async (call, callback) => {
    try {
      const { name, email, password } = call.request;

      // Validate input
      if (!name || !email || !password) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Name, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: "User with this email already exists",
        });
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

      console.log(`✅ User registered: ${email}`);

      callback(null, SignupResponse.fromPartial({ user: safeUser }));
    } catch (err) {
      console.error("❌ Signup Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to register user",
      });
    }
  },

  /**
   * SIGNIN - Authenticate user and return tokens
   */
  signin: async (call, callback) => {
    try {
      const { email, password } = call.request;

      // Validate input
      if (!email || !password) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Email and password are required",
        });
      }

      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }

      // Verify password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Invalid credentials",
        });
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

      console.log(`✅ User signed in: ${email}`);

      callback(
        null,
        SigninResponse.fromPartial({
          user: safeUser,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      console.error("❌ Signin Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to sign in",
      });
    }
  },

  /**
   * REFRESH TOKEN - Generate new tokens using refresh token
   */
  refreshToken: async (call, callback) => {
    try {
      const { refreshToken } = call.request;

      // Validate input
      if (!refreshToken) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Refresh token is required",
        });
      }

      // Verify the refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, JWT_SECRET);
      } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Invalid or expired refresh token",
        });
      }

      // Verify user still exists in database
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }

      // Remove password and JWT-specific fields
      const { password, ...safeUser } = user;
      const { iat, exp, ...cleanUserData } = decoded;

      // Generate new tokens with fresh user data from database
      const newAccessToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "1h",
      });

      const newRefreshToken = jwt.sign(safeUser, JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log(`✅ Tokens refreshed for user: ${user.email}`);

      callback(
        null,
        RefreshTokenResponse.fromPartial({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          success: true,
          message: "Tokens refreshed successfully",
        })
      );
    } catch (err) {
      console.error("❌ RefreshToken Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Failed to refresh token",
      });
    }
  },
};

/**
 * Start the gRPC server
 */
function startServer() {
  const server = new grpc.Server();

  // Add the auth service
  server.addService(AuthServiceService, authServiceImpl);

  const PORT = process.env.AUTH_SERVICE_PORT || 50051;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start server:", err);
        throw err;
      }
      console.log(`🟢 AuthService running on port ${port}`);
      console.log(`📡 Available methods: Signup, Signin, RefreshToken`);
    }
  );
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down AuthService...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down AuthService...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();
