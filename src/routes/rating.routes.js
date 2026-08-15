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

/**
 * @openapi
 * /api/ratings/store/{storeId}:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Get ratings for a store
 *     description: Get all ratings and comments submitted for a specific store.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: string
 *         example: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of ratings per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Store ratings retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Store not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/store/:storeId",
  authenticate,
  getStoreRatings
);

/**
 * @openapi
 * /api/ratings/my:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Get current user's ratings
 *     description: Get all ratings and comments submitted by the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of ratings per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: User ratings retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/my",
  authenticate,
  getMyRatings
);

/**
 * @openapi
 * /api/ratings/store/{storeId}:
 *   post:
 *     tags:
 *       - Ratings
 *     summary: Submit a store rating
 *     description: |
 *       Submit a rating and optional comment for a store.
 *
 *       Only normal users can submit ratings.
 *       A user can submit only one rating per store.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: string
 *         example: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 nullable: true
 *                 example: Excellent store and service!
 *
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *
 *       400:
 *         description: Invalid rating or validation failed
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Only normal users can submit ratings
 *
 *       404:
 *         description: Store not found
 *
 *       409:
 *         description: User has already rated this store
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/store/:storeId",
  authenticate,
  requireRole("USER"),
  createRating
);

/**
 * @openapi
 * /api/ratings/store/{storeId}:
 *   patch:
 *     tags:
 *       - Ratings
 *     summary: Update user's rating
 *     description: Update the currently authenticated user's rating and/or comment for a store.
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         description: Store ID
 *         schema:
 *           type: string
 *         example: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 nullable: true
 *                 example: Good service.
 *
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *
 *       400:
 *         description: Invalid rating or validation failed
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Only normal users can update ratings
 *
 *       404:
 *         description: Rating or store not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/store/:storeId",
  authenticate,
  requireRole("USER"),
  updateRating
);

/**
 * @openapi
 * /api/ratings/owner:
 *   get:
 *     tags:
 *       - Owner
 *     summary: Get ratings for owner's stores
 *     description: |
 *       Get ratings and comments submitted by users for stores
 *       owned by the currently authenticated store owner.
 *
 *       Only STORE_OWNER users can access this endpoint.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: storeId
 *         in: query
 *         required: false
 *         description: Filter ratings by a specific owned store
 *         schema:
 *           type: string
 *         example: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *
 *       - name: rating
 *         in: query
 *         required: false
 *         description: Filter by rating value
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         example: 5
 *
 *       - name: search
 *         in: query
 *         required: false
 *         description: Search ratings by user name, email, or comment
 *         schema:
 *           type: string
 *         example: Shubham
 *
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of ratings per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Owner ratings retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Store owner access required
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/owner",
  authenticate,
  requireRole("STORE_OWNER"),
  getOwnerRatings
);

/**
 * @openapi
 * /api/ratings/admin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all ratings
 *     description: |
 *       Get ratings submitted across the entire platform.
 *
 *       Only administrators can access this endpoint.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         description: Search by user name, user email, store name, or comment
 *         schema:
 *           type: string
 *         example: Delhi
 *
 *       - name: rating
 *         in: query
 *         required: false
 *         description: Filter by rating value
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         example: 5
 *
 *       - name: storeId
 *         in: query
 *         required: false
 *         description: Filter ratings by store ID
 *         schema:
 *           type: string
 *         example: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *
 *       - name: userId
 *         in: query
 *         required: false
 *         description: Filter ratings by user ID
 *         schema:
 *           type: string
 *         example: "b1394a15-4626-41f6-a50f-b0a41623a7f7"
 *
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of ratings per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: All ratings retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin",
  authenticate,
  requireRole("ADMIN"),
  getAdminRatings
);

export default router;