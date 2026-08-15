import express from "express";

import {
  createRating,
  updateRating,
  getStoreRatings,
  getMyRatings,
  getOwnerRatings,
  getAdminRatings,
} from "../controllers/rating.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Get ratings for a store
router.get(
  "/store/:storeId",
  authenticate,
  getStoreRatings
);

// Get current user's ratings
router.get(
  "/my",
  authenticate,
  getMyRatings
);

// Submit rating
router.post(
  "/store/:storeId",
  authenticate,
  requireRole("USER"),
  createRating
);

// Update rating/comment
router.patch(
  "/store/:storeId",
  authenticate,
  requireRole("USER"),
  updateRating
);

// Store owner - ratings for own stores
router.get(
  "/owner",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerRatings
);

// Admin - all ratings
router.get(
  "/admin",
  authenticate,
  requireRole("ADMIN"),
  getAdminRatings
);

export default router;