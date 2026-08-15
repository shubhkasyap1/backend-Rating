import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import storeRoutes from "./routes/store.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import adminDashboardRoutes from "./routes/admin.dashboard.routes.js";
import ownerDashboardRoutes from "./routes/owner.dashboard.routes.js";

import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/owner", ownerDashboardRoutes)

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Store Rating API is running",
  });
});

export default app;