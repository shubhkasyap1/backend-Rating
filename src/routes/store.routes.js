import express from "express";

import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  getOwnerStores,
  getOwnerStoreById,
} from "../controllers/store.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/stores:
 *   get:
 *     tags:
 *       - Stores
 *     summary: Get stores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search stores by name
 *       - name: address
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter stores by address
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Store list
 */

// Anyone logged in can view stores
router.get("/", authenticate, getStores);

// Store owner routes — MUST come before "/:id"
router.get(
  "/owner/my",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerStores
);

router.get(
  "/owner/my/:id",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerStoreById
);

// Get a single store
router.get(
  "/:id",
  authenticate,
  getStoreById
);

// Admin can create stores
router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  createStore
);

// Admin + owner can update
router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN", "STORE_OWNER"),
  updateStore
);

// Admin only can delete
router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  deleteStore
);

export default router;