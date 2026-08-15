import express from "express";

import {
  register,
  login,
  getMe,
  refresh,
  logout,
  updatePassword,
  resetPassword,
  forgotPassword,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Register a new normal user.
 *
 *       Public registration creates users with the USER role.
 *       ADMIN and STORE_OWNER accounts should be created by an administrator.
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
 *               - address
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Shubham Kumar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: shubham@example.com
 *               address:
 *                 type: string
 *                 example: Delhi, India
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Shubham@12345
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *       400:
 *         description: Validation failed
 *
 *       409:
 *         description: Email already registered
 *
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: |
 *       Login as ADMIN, USER, or STORE_OWNER.
 *
 *       Returns an access token and refresh token.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@storerating.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@12345
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIs...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIs...
 *                 user:
 *                   id: "b1394a15-4626-41f6-a50f-b0a41623a7f7"
 *                   name: Shubham Kumar
 *                   email: admin@storerating.com
 *                   role: ADMIN
 *
 *       400:
 *         description: Validation failed
 *
 *       401:
 *         description: Invalid email or password
 *
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current authenticated user
 *     description: Returns the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *
 *       401:
 *         description: Authentication required or token invalid
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/me", authenticate, getMe);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Generate a new access token using a valid refresh token.
 *
 *       The refresh token may be supplied through the request body
 *       or cookie depending on the backend implementation.
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *
 *       401:
 *         description: Invalid or expired refresh token
 *
 *       500:
 *         description: Internal server error
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout current user
 *     description: |
 *       Logout the authenticated user and invalidate/clear
 *       the authentication tokens.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Logout successful
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Internal server error
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/password:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Update current user's password
 *     description: |
 *       Change the password of the currently authenticated user.
 *
 *       This endpoint is available to:
 *       - ADMIN
 *       - USER
 *       - STORE_OWNER
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password updated successfully
 *
 *       400:
 *         description: Invalid request or new password validation failed
 *
 *       401:
 *         description: Current password is incorrect or authentication failed
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/password",
  authenticate,
  updatePassword
);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: |
 *       Start the password reset process.
 *
 *       A reset token is generated for the supplied email address.
 *       In production, this token should be delivered through email.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *
 *     responses:
 *       200:
 *         description: Password reset request processed
 *
 *       400:
 *         description: Email is required
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/forgot-password",
  forgotPassword
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: |
 *       Reset a user's password using a valid password reset token.
 *
 *       The reset token expires after a limited period and
 *       can only be used once.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123resettoken
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 *       400:
 *         description: Invalid or expired reset token
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/reset-password",
  resetPassword
);

export default router;