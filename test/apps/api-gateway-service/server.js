import express from "express";
import cors from "cors";
import rootRouter from "./routes/index.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Your frontend URL
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v1", rootRouter);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () =>
  console.log(`API Gateway running on http://localhost:${PORT}`)
);
