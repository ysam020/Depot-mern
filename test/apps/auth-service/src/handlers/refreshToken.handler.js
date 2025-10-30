import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import { RefreshTokenResponse } from "@depot/proto-defs/user";

const JWT_SECRET = process.env.JWT_SECRET;

export async function refreshTokenHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { refreshToken } = call.request;

    // Validate required fields
    if (
      controller.validateFields(callback, { refreshToken }, ["refreshToken"])
    ) {
      return;
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return controller.sendError(
        callback,
        grpc.status.UNAUTHENTICATED,
        "Invalid or expired refresh token"
      );
    }

    // Verify user exists
    const user = await controller.findByIdOrFail(callback, decoded.id);
    if (!user) return;

    const safeUser = controller.sanitizeUser(user);

    // Generate new tokens
    const newAccessToken = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "1h",
    });
    const newRefreshToken = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "7d",
    });

    controller.sendSuccess(callback, RefreshTokenResponse, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      success: true,
      message: "Tokens refreshed successfully",
    });
  });
}
