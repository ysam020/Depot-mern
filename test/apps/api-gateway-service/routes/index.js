import { Router } from "express";
import authRouter from "./auth.js";
import productRouter from "./product.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import paymentRouter from "./payment.js";
import orderRouter from "./order.js";
import { jwtMiddleware } from "../middlewares/auth.js";

const rootRouter = Router();

// Public routes (no authentication required)
rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);

// Protected routes (authentication required)
rootRouter.use("/cart", jwtMiddleware, cartRouter);
rootRouter.use("/wishlist", jwtMiddleware, wishlistRouter);
rootRouter.use("/payment", jwtMiddleware, paymentRouter);
rootRouter.use("/orders", jwtMiddleware, orderRouter);

// Health check endpoint
rootRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "API Gateway",
  });
});

export default rootRouter;
