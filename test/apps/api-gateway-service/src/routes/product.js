import express from "express";
import ProductController from "../controllers/product.js";

const router = express.Router();

router.get("/", ProductController.listProducts);

router.get("/:id", ProductController.getProduct);

export default router;
