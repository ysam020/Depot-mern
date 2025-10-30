import jwt from "jsonwebtoken";

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

export const getUserIdFromMetadata = (metadata, jwtSecret) => {
  const payload = getUserFromMetadata(metadata, jwtSecret);

  if (!payload.id) {
    throw new Error("User ID not found in token");
  }

  return payload.id;
};

export const signToken = (payload, jwtSecret, options = {}) => {
  return jwt.sign(payload, jwtSecret, options);
};

export const verifyToken = (token, jwtSecret) => {
  return jwt.verify(token, jwtSecret);
};
