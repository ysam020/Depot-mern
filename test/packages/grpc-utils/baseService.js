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

  /**
   * Start the gRPC server
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `${this.host}:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            console.error(`❌ Failed to start ${this.serviceName}:`, err);
            reject(err);
            return;
          }
          console.log(`${this.serviceName} running on port ${port}`);
          resolve(port);
        }
      );
    });
  }

  /**
   * Stop the gRPC server gracefully
   */
  async stop() {
    return new Promise((resolve) => {
      this.server.tryShutdown(async () => {
        console.log(`🛑 ${this.serviceName} stopped`);
        await prisma.$disconnect();
        resolve();
      });
    });
  }

  /**
   * Setup graceful shutdown handlers for SIGINT and SIGTERM
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down ${this.serviceName}...`);
      await this.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  /**
   * Wrapper for service methods that handles common error patterns
   * @param {Function} handler - The actual service implementation function
   * @returns {Function} - Wrapped handler with error handling
   */
  static wrapHandler(handler) {
    return async (call, callback) => {
      try {
        await handler(call, callback);
      } catch (err) {
        console.error("❌ Service Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: err.message || "Internal server error",
        });
      }
    };
  }

  /**
   * Helper method to send gRPC errors with proper status codes
   */
  static sendError(callback, code, message) {
    callback({
      code: code,
      message: message,
    });
  }

  /**
   * Helper method to validate required fields
   * @param {Object} data - The data object to validate
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object|null} - Returns error object if validation fails, null otherwise
   */
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
}
