const removeEmptyFields = (obj) => {
  if (Array.isArray(obj)) {
    // Filter out empty items and recursively clean remaining items
    return obj
      .map((item) => removeEmptyFields(item))
      .filter((item) => {
        if (item === "") return false;
        if (Array.isArray(item) && item.length === 0) return false;
        if (
          typeof item === "object" &&
          item !== null &&
          Object.keys(item).length === 0
        )
          return false;
        return true;
      });
  }

  if (obj !== null && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip empty strings, empty arrays, and empty objects
      if (value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 0
      )
        continue;

      // Recursively clean nested objects/arrays
      cleaned[key] = removeEmptyFields(value);
    }
    return cleaned;
  }

  return obj;
};

export const successResponse = (data = {}, message = "Success") => {
  return {
    success: true,
    data: removeEmptyFields(data),
    message,
  };
};

export const errorResponse = (message = "An error occurred", data = {}) => {
  return {
    success: false,
    data: removeEmptyFields(data),
    message,
  };
};

export const formatResponse = (success, data, message) => {
  return {
    success,
    data: removeEmptyFields(data),
    message,
  };
};
