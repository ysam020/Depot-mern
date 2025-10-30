import bcrypt from "bcrypt";
import { SignupResponse } from "@depot/proto-defs/user";

export async function signupHandler(controller, call, callback) {
  await controller.execute(call, callback, async () => {
    const { name, email, password } = call.request;

    // Validate required fields
    if (
      controller.validateFields(callback, { name, email, password }, [
        "name",
        "email",
        "password",
      ])
    ) {
      return;
    }

    // Check if user already exists
    const exists = await controller.checkExistsAndFail(
      callback,
      { email },
      "User with this email already exists"
    );
    if (exists) return;

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await controller.create({
      name,
      email,
      password: hashedPassword,
    });

    const safeUser = controller.sanitizeUser(user);

    controller.sendSuccess(callback, SignupResponse, { user: safeUser });
  });
}
