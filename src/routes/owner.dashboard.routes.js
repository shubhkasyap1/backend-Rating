import express from "express";

import {
  getOwnerDashboard,
} from "../controllers/owner.dashboard.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  requireRole,
} from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerDashboard
);

export default router;