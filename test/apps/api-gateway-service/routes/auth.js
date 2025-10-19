import express from "express";
import { AuthServiceClient } from "../../../dist/user.js";
import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const AUTH_SERVICE_ADDRESS = process.env.AUTH_SERVICE_ADDRESS;

const authClient = new AuthServiceClient(
  AUTH_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  authClient.signup({ name, email, password }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.user);
  });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  authClient.signin({ email, password }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

export default router;
