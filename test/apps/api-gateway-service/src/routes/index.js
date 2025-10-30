import { Router } from "express";
import authRouter from "./auth.js";
import productRouter from "./product.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import paymentRouter from "./payment.js";
import orderRouter from "./order.js";
import { jwtMiddleware } from "../middlewares/auth.js";

const rootRouter = Router();

// Public routes
rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);

// Protected routes
rootRouter.use("/cart", jwtMiddleware, cartRouter);
rootRouter.use("/orders", jwtMiddleware, orderRouter);
rootRouter.use("/payment", jwtMiddleware, paymentRouter);
rootRouter.use("/wishlist", jwtMiddleware, wishlistRouter);

// Health check endpoint
rootRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "API Gateway",
  });
});

export default rootRouter;
