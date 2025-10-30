import express from "express";
import { RequestValidator } from "@depot/grpc-utils";
import AuthController from "../controllers/auth.js";

const router = express.Router();

router.post(
  "/signup",
  RequestValidator.middleware(["name", "email", "password"]),
  AuthController.signup
);

router.post(
  "/signin",
  RequestValidator.middleware(["email", "password"]),
  AuthController.signin
);

router.post(
  "/refresh-token",
  RequestValidator.middleware(["refreshToken"]),
  AuthController.refreshToken
);

router.post("/logout", AuthController.logout);

export default router;
