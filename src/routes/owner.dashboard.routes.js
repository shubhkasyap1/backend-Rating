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

/**
 * @openapi
 * /api/owner/dashboard:
 *   get:
 *     tags:
 *       - Owner
 *     summary: Get store owner dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owner dashboard statistics and recent ratings
 *       403:
 *         description: Store owner access required
 */
router.get(
  "/dashboard",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerDashboard
);

export default router;