import express from "express";
import rootRouter from "./routes/index.js";

const app = express();
app.use(express.json());
app.use("/api/v1", rootRouter);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () =>
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`)
);
