import express from "express";

import { getDashboard } from "../controllers/admin.dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Admin access required
 */
router.get(
  "/dashboard",
  authenticate,
  requireRole("ADMIN"),
  getDashboard
);

export default router;

