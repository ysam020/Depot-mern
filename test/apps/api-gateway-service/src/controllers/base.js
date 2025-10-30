import {
  GrpcErrorHandler,
  ResponseFormatter,
  GrpcClientManager,
  authHelper,
} from "@depot/grpc-utils";

class BaseController {
  constructor(grpcClient) {
    this.client = grpcClient;
  }

  async executeGrpcCall(
    req,
    res,
    method,
    payload,
    {
      transformer = (response) => response,
      successMessage = "Operation successful",
      errorMessage = "Operation failed",
      statusCode = 200,
      includeMetadata = false,
      requireAuth = false,
      notFoundCheck = null,
      notFoundMessage = "Resource not found",
    } = {}
  ) {
    // Check authentication if required
    if (requireAuth) {
      const userId = this.getUserId(req);
      if (!userId) {
        return this.sendUnauthorized(res);
      }
    }

    const args = [payload];

    // Add metadata for authenticated requests
    if (includeMetadata) {
      args.push(GrpcClientManager.createMetadata(req));
    }

    // Add callback
    args.push(
      GrpcErrorHandler.wrapCallback(
        res,
        (response) => {
          // Check if resource not found
          if (notFoundCheck && notFoundCheck(response)) {
            return this.sendNotFound(res, notFoundMessage);
          }

          const transformedData = transformer(response);

          // Handle dynamic success messages
          const message =
            typeof successMessage === "function"
              ? successMessage(response)
              : successMessage;

          if (statusCode === 201) {
            ResponseFormatter.created(res, transformedData, message);
          } else {
            ResponseFormatter.success(res, transformedData, message);
          }
        },
        errorMessage
      )
    );

    this.client[method](...args);
  }

  getUserId(req) {
    return authHelper.getUserIdFromRequest(req);
  }

  extractPagination(req, defaults = { limit: 100, offset: 0 }) {
    const limit = parseInt(req.query.limit) || defaults.limit;
    const offset = parseInt(req.query.offset) || defaults.offset;

    return {
      limit: Math.max(1, Math.min(limit, 1000)),
      offset: Math.max(0, offset),
    };
  }

  extractQueryParams(req, params) {
    return params.reduce((acc, param) => {
      const value = req.query[param];
      if (value !== undefined) {
        acc[param] = value;
      }
      return acc;
    }, {});
  }

  validateRequiredFields(data, fieldConfigs) {
    const errors = {};

    fieldConfigs.forEach((config) => {
      if (typeof config === "string") {
        // Simple field name
        if (!data[config]) {
          errors[config] = `${this.formatFieldName(config)} is required`;
        }
      } else {
        // Object with field name and custom message
        const { field, message, validator } = config;

        if (validator) {
          // Custom validator function
          if (!validator(data[field])) {
            errors[field] =
              message || `${this.formatFieldName(field)} is invalid`;
          }
        } else if (!data[field]) {
          errors[field] =
            message || `${this.formatFieldName(field)} is required`;
        }
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  formatFieldName(field) {
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  snakeToCamel(obj) {
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.snakeToCamel(item));
    }

    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      acc[camelKey] = this.snakeToCamel(obj[key]);
      return acc;
    }, {});
  }

  camelToSnake(obj) {
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.camelToSnake(item));
    }

    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = this.camelToSnake(obj[key]);
      return acc;
    }, {});
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  extractFields(req, fields) {
    return fields.reduce((acc, field) => {
      acc[field] = req.body[field];
      return acc;
    }, {});
  }

  extractId(req, paramName = "id") {
    const id = req.params[paramName];
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return null;
    }

    return parsedId;
  }

  sendValidationError(res, errors) {
    return ResponseFormatter.validationError(res, errors);
  }

  sendUnauthorized(res, message = "Unauthorized") {
    return ResponseFormatter.unauthorized(res, message);
  }

  sendNotFound(res, message = "Resource not found") {
    return ResponseFormatter.notFound(res, message);
  }

  validateId(req, res, paramName = "id") {
    const id = this.extractId(req, paramName);

    if (id === null) {
      this.sendValidationError(res, {
        [paramName]: `Invalid ${paramName}`,
      });
      return null;
    }

    return id;
  }
}

export default BaseController;
