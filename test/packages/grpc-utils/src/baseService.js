import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export class BaseGrpcService {
  constructor(
    serviceName,
    serviceDefinition,
    serviceImplementation,
    options = {}
  ) {
    this.serviceName = serviceName;
    this.serviceDefinition = serviceDefinition;
    this.serviceImplementation = serviceImplementation;
    this.server = new grpc.Server();
    this.port =
      options.port || process.env[`${serviceName.toUpperCase()}_SERVICE_PORT`];
    this.host = options.host || "0.0.0.0";

    // Add the service to the server
    this.server.addService(this.serviceDefinition, this.serviceImplementation);

    // Setup graceful shutdown handlers
    this.setupGracefulShutdown();
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `${this.host}:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            console.error(`Failed to start ${this.serviceName}:`, err);
            reject(err);
            return;
          }
          console.log(`${this.serviceName} running on port ${port}`);
          resolve(port);
        }
      );
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.server.tryShutdown(async () => {
        console.log(`${this.serviceName} stopped`);
        await prisma.$disconnect();
        resolve();
      });
    });
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down ${this.serviceName}...`);
      await this.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  static wrapHandler(handler) {
    return async (call, callback) => {
      try {
        await handler(call, callback);
      } catch (err) {
        console.error("Service Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: err.message || "Internal server error",
        });
      }
    };
  }

  static sendError(callback, code, message) {
    callback({
      code: code,
      message: message,
    });
  }

  static validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      return {
        code: grpc.status.INVALID_ARGUMENT,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    return null;
  }

  static autoWrapMethods(serviceClass, methodNames) {
    const serviceImpl = {};

    for (const methodName of methodNames) {
      if (typeof serviceClass[methodName] !== "function") {
        throw new Error(
          `Method ${methodName} not found in ${serviceClass.name}`
        );
      }

      serviceImpl[methodName] = this.wrapHandler(serviceClass[methodName]);
    }

    return serviceImpl;
  }

  static createService(
    serviceName,
    serviceDefinition,
    serviceClass,
    options = {}
  ) {
    // Extract method names from service definition
    const methodNames = Object.keys(serviceDefinition).filter(
      (key) =>
        typeof serviceDefinition[key] === "object" &&
        serviceDefinition[key].path
    );

    const serviceImpl = this.autoWrapMethods(serviceClass, methodNames);

    return new BaseGrpcService(
      serviceName,
      serviceDefinition,
      serviceImpl,
      options
    );
  }

  static validateAndSendError(callback, data, requiredFields) {
    const validationError = this.validateRequiredFields(data, requiredFields);

    if (validationError) {
      this.sendError(callback, validationError.code, validationError.message);
      return true; // Validation failed
    }

    return false; // Validation passed
  }

  static handleCommonError(
    callback,
    error,
    defaultMessage = "Operation failed"
  ) {
    console.error("Error:", error);

    // Prisma errors
    if (error.code === "P2002") {
      return this.sendError(
        callback,
        grpc.status.ALREADY_EXISTS,
        "Resource already exists"
      );
    }

    if (error.code === "P2025") {
      return this.sendError(
        callback,
        grpc.status.NOT_FOUND,
        "Resource not found"
      );
    }

    // JWT errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return this.sendError(
        callback,
        grpc.status.UNAUTHENTICATED,
        "Invalid or expired token"
      );
    }

    // Default internal error
    return this.sendError(
      callback,
      grpc.status.INTERNAL,
      error.message || defaultMessage
    );
  }

  static safeCallback(callback) {
    let called = false;

    return (err, response) => {
      if (called) {
        console.warn("⚠️ Attempted to call callback twice - ignored");
        return;
      }

      called = true;
      callback(err, response);
    };
  }

  static successResponse(ResponseClass, data) {
    return ResponseClass.fromPartial(data);
  }

  static async asyncHandler(callback, handler) {
    try {
      await handler();
    } catch (err) {
      this.handleCommonError(callback, err);
    }
  }
}
