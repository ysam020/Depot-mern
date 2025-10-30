import express from "express";
import OrderController from "../controllers/order.js";

const router = express.Router();

router.get("/", OrderController.listOrders);

router.get("/:id", OrderController.getOrder);

router.patch("/:id/status", OrderController.updateOrderStatus);

export default router;
