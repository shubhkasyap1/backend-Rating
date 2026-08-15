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

// Anyone logged in can view stores
router.get(
  "/",
  authenticate,
  getStores
);

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

export default router;