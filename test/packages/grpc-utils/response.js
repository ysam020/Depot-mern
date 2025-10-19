/**
 * Format a successful response
 * @param {Object|Array} data - Response data
 * @param {string} message - Success message (optional)
 * @returns {Object} Formatted success response
 */
export const successResponse = (data = {}, message = "Success") => {
  return {
    success: true,
    data,
    message,
  };
};

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {Object|Array} data - Additional error data (optional)
 * @returns {Object} Formatted error response
 */
export const errorResponse = (message = "An error occurred", data = {}) => {
  return {
    success: false,
    data,
    message,
  };
};

/**
 * Format a response with custom success status
 * @param {boolean} success - Success status
 * @param {Object|Array} data - Response data
 * @param {string} message - Response message
 * @returns {Object} Formatted response
 */
export const formatResponse = (success, data, message) => {
  return {
    success,
    data,
    message,
  };
};
