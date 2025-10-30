import jwt from "jsonwebtoken";

class AuthHelper {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET;

    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET must be provided or set in environment");
    }
  }

  getUserIdFromRequest(req) {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded.id || null;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return null;
    }
  }

  getUserFromRequest(req) {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    return authHeader.replace("Bearer ", "").trim();
  }

  isTokenValid(token) {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch {
      return false;
    }
  }

  generateAccessToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  generateRefreshToken(payload, expiresIn = "7d") {
    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }
}

export const authHelper = new AuthHelper();
export { AuthHelper };
