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

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, getMe);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.patch(
  "/password",
  authenticate,
  updatePassword
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

export default router;