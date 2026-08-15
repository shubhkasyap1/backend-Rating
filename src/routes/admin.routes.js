import express from "express";

import {
  createUser,
  getUsers,
} from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new user
 *     description: |
 *       Create a new platform user.
 *
 *       The administrator can create:
 *       - USER
 *       - STORE_OWNER
 *       - ADMIN
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - address
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Kumar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Rahul@12345
 *               address:
 *                 type: string
 *                 example: Delhi, India
 *               role:
 *                 type: string
 *                 enum:
 *                   - USER
 *                   - STORE_OWNER
 *                   - ADMIN
 *                 example: USER
 *
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User created successfully
 *               data:
 *                 user:
 *                   id: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *                   name: Rahul Kumar
 *                   email: rahul@example.com
 *                   address: Delhi, India
 *                   role: USER
 *
 *       400:
 *         description: Validation failed
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       409:
 *         description: Email already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  createUser
);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get users
 *     description: |
 *       Get a paginated list of users.
 *
 *       Admin can filter users by:
 *       - Name
 *       - Email
 *       - Address
 *       - Role
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search by user name, email, or address
 *         required: false
 *         schema:
 *           type: string
 *         example: Rahul
 *
 *       - name: role
 *         in: query
 *         description: Filter users by role
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - USER
 *             - STORE_OWNER
 *         example: USER
 *
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - name: limit
 *         in: query
 *         description: Number of users per page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - id: "8c8b7c1a-9e35-4a8e-bb7f-7d1a1c8f6e91"
 *                     name: Rahul Kumar
 *                     email: rahul@example.com
 *                     address: Delhi, India
 *                     role: USER
 *                     createdAt: "2026-08-15T10:30:00.000Z"
 *                     updatedAt: "2026-08-15T10:30:00.000Z"
 *                     _count:
 *                       ratings: 3
 *                       stores: 0
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   totalPages: 3
 *                   hasNextPage: true
 *                   hasPreviousPage: false
 *
 *       400:
 *         description: Invalid role filter
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
  "/users",
  authenticate,
  requireRole("ADMIN"),
  getUsers
);

export default router;