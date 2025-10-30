class RequestValidator {
  static validateRequired(data, requiredFields) {
    const errors = {};

    for (const field of requiredFields) {
      if (
        !data[field] ||
        (typeof data[field] === "string" && data[field].trim() === "")
      ) {
        errors[field] = `${field} is required`;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  static middleware(requiredFields, source = "body") {
    return (req, res, next) => {
      const errors = this.validateRequired(req[source], requiredFields);

      if (errors) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      next();
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static isPositiveInteger(value) {
    const num = parseInt(value, 10);
    return Number.isInteger(num) && num > 0;
  }

  static minLength(value, minLength) {
    return typeof value === "string" && value.length >= minLength;
  }

  static maxLength(value, maxLength) {
    return typeof value === "string" && value.length <= maxLength;
  }

  static validate(data, rules) {
    const errors = {};

    for (const [field, [validator, message]] of Object.entries(rules)) {
      if (data[field] !== undefined && !validator(data[field])) {
        errors[field] = message;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

export { RequestValidator };
