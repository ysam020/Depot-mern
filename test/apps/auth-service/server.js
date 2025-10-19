import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma"; // your Prisma client
import {
  AuthServiceService,
  SignupResponse,
  SigninResponse,
} from "../../dist/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Implement the service using Prisma
const authServiceImpl = {
  signup: async (call, callback) => {
    try {
      const hashedPassword = await bcrypt.hash(call.request.password, 10);
      const user = await prisma.users.create({
        data: {
          name: call.request.name,
          email: call.request.email,
          password: hashedPassword,
        },
      });

      callback(null, SignupResponse.fromPartial({ user }));
    } catch (err) {
      console.error("gRPC Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  signin: async (call, callback) => {
    try {
      const user = await prisma.users.findUnique({
        where: { email: call.request.email },
      });

      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        call.request.password,
        user.password
      );
      if (!isPasswordMatch) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Password didn't match",
        });
      }

      const { password, ...safeUser } = user;

      const accessToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });

      callback(
        null,
        SigninResponse.fromPartial({
          user: safeUser,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      console.error("gRPC Error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(AuthServiceService, authServiceImpl);

  const PORT = process.env.AUTH_SERVICE_PORT;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) throw err;
      console.log(`🟢 AuthService running on port ${port}`);
    }
  );
}

startServer();
