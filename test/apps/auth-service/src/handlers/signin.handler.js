import grpc from "@grpc/grpc-js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SigninResponse } from "@depot/proto-defs/user";

const JWT_SECRET = process.env.JWT_SECRET;

export async function signinHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { email, password } = call.request;

    // Validate required fields
    if (
      controller.validateFields(callback, { email, password }, [
        "email",
        "password",
      ])
    ) {
      return;
    }

    // Find user
    const user = await controller.findOneOrFail(callback, { email });
    if (!user) return;

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return controller.sendError(
        callback,
        grpc.status.UNAUTHENTICATED,
        "Invalid credentials"
      );
    }

    const safeUser = controller.sanitizeUser(user);

    // Generate tokens
    const accessToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });

    controller.sendSuccess(callback, SigninResponse, {
      user: safeUser,
      accessToken,
      refreshToken,
    });
  });
}
