import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/create-order", PaymentController.createOrder);

router.post("/verify", PaymentController.verifyPayment);

export default router;
