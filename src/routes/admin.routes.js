import express from "express";

import { createUser, getUsers } from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  createUser
);

router.get(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  getUsers
);

export default router;