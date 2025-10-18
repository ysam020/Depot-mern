import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(403).json({ message: "Invalid or expired token." });
      }

      // Attach decoded user info to request object
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("Error in auth middleware:", err);
    res.status(500).json({ message: "Server error in authentication." });
  }
};

export default verifyToken;
