import express from "express";
import CartController from "../controllers/cart.js";

const router = express.Router();

router.post("/", CartController.addToCart);

router.put("/:id", CartController.updateCart);

router.delete("/:id", CartController.deleteFromCart);

router.get("/", CartController.getCart);

export default router;
