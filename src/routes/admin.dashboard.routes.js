import express from "express";

import { getDashboard } from "../controllers/admin.dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requireRole("ADMIN"),
  getDashboard
);

export default router;

