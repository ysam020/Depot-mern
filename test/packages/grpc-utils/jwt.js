import jwt from "jsonwebtoken";

/**
 * Extract and verify JWT from gRPC metadata
 * @param {Object} metadata - gRPC metadata object
 * @param {string} jwtSecret - JWT secret for verification
 * @returns {Object} Decoded JWT payload
 * @throws {Error} If auth header is missing or token is invalid
 */
export const getUserFromMetadata = (metadata, jwtSecret) => {
  const authHeader = metadata.get("authorization")[0]?.toString();

  if (!authHeader) {
    throw new Error("Authorization header missing");
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, jwtSecret);
    return payload;
  } catch (err) {
    throw new Error(`Invalid or expired token: ${err.message}`);
  }
};

/**
 * Extract user ID from gRPC metadata
 * @param {Object} metadata - gRPC metadata object
 * @param {string} jwtSecret - JWT secret for verification
 * @returns {number} User ID
 * @throws {Error} If auth header is missing, token is invalid, or user ID is missing
 */
export const getUserIdFromMetadata = (metadata, jwtSecret) => {
  const payload = getUserFromMetadata(metadata, jwtSecret);

  if (!payload.id) {
    throw new Error("User ID not found in token");
  }

  return payload.id;
};

/**
 * Sign a JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {string} jwtSecret - JWT secret for signing
 * @param {Object} options - JWT sign options (expiresIn, etc.)
 * @returns {string} Signed JWT token
 */
export const signToken = (payload, jwtSecret, options = {}) => {
  return jwt.sign(payload, jwtSecret, options);
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} jwtSecret - JWT secret for verification
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid
 */
export const verifyToken = (token, jwtSecret) => {
  return jwt.verify(token, jwtSecret);
};
