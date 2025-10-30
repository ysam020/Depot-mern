import grpc from "@grpc/grpc-js";

class GrpcErrorHandler {
  static STATUS_MAP = {
    [grpc.status.OK]: 200,
    [grpc.status.CANCELLED]: 499,
    [grpc.status.UNKNOWN]: 500,
    [grpc.status.INVALID_ARGUMENT]: 400,
    [grpc.status.DEADLINE_EXCEEDED]: 504,
    [grpc.status.NOT_FOUND]: 404,
    [grpc.status.ALREADY_EXISTS]: 409,
    [grpc.status.PERMISSION_DENIED]: 403,
    [grpc.status.RESOURCE_EXHAUSTED]: 429,
    [grpc.status.FAILED_PRECONDITION]: 400,
    [grpc.status.ABORTED]: 409,
    [grpc.status.OUT_OF_RANGE]: 400,
    [grpc.status.UNIMPLEMENTED]: 501,
    [grpc.status.INTERNAL]: 500,
    [grpc.status.UNAVAILABLE]: 503,
    [grpc.status.DATA_LOSS]: 500,
    [grpc.status.UNAUTHENTICATED]: 401,
  };

  static handleError(
    err,
    res,
    defaultMessage = "Operation failed",
    customStatusMap = {}
  ) {
    if (!err) {
      return res.status(500).json({
        success: false,
        message: "Unknown error occurred",
      });
    }

    console.error("gRPC Error:", {
      code: err.code,
      message: err.message,
      details: err.details,
    });

    // Merge custom status mappings
    const statusMap = { ...this.STATUS_MAP, ...customStatusMap };
    const statusCode = statusMap[err.code] || 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || defaultMessage,
    });
  }

  static wrapCallback(
    res,
    successHandler,
    errorMessage = "Operation failed",
    customStatusMap = {}
  ) {
    return (err, response) => {
      if (err) {
        return this.handleError(err, res, errorMessage, customStatusMap);
      }
      successHandler(response);
    };
  }

  static promisify(grpcCall, request, metadata = null) {
    return new Promise((resolve, reject) => {
      const args = metadata ? [request, metadata] : [request];
      grpcCall(...args, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}

export { GrpcErrorHandler };
