import authRouter from "./auth.js";
import productRouter from "./product.js";
import cartRouter from "./cart.js";
import { jwtMiddleware } from "../middlewares/auth.js";

import { Router } from "express";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productRouter);
rootRouter.use("/cart", jwtMiddleware, cartRouter);

export default rootRouter;
