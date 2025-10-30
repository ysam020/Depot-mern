class ResponseFormatter {
  static success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res,
    message = "Error occurred",
    statusCode = 500,
    errors = null
  ) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  static noContent(res) {
    return res.status(204).end();
  }

  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = "Forbidden") {
    return this.error(res, message, 403);
  }

  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  static validationError(res, errors, message = "Validation failed") {
    return this.error(res, message, 400, errors);
  }

  static conflict(res, message = "Resource already exists") {
    return this.error(res, message, 409);
  }
}

export { ResponseFormatter };
