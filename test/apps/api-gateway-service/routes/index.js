// import authRouter from "./auth.js";
// import productRouter from "./product.js";
// import cartRouter from "./cart.js";
// import { jwtMiddleware } from "../middlewares/auth.js";

// import { Router } from "express";

// const rootRouter = Router();

// rootRouter.use("/auth", authRouter);
// rootRouter.use("/products", productRouter);
// rootRouter.use("/cart", jwtMiddleware, cartRouter);

// export default rootRouter;

import { Router } from "express";
import authRouter from "./auth.js";
import productRouter from "./product.js";
import cartRouter from "./cart.js";
import { jwtMiddleware } from "../middlewares/auth.js";

const rootRouter = Router();

// Public routes (no authentication required)
rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);

// Protected routes (authentication required)
rootRouter.use("/cart", jwtMiddleware, cartRouter);

// Health check endpoint
rootRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "API Gateway",
  });
});

export default rootRouter;
