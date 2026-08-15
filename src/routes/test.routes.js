import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

router.get(
  "/user",
  authenticate,
  requireRole("USER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome User",
      user: req.user,
    });
  }
);

router.get(
  "/store-owner",
  authenticate,
  requireRole("STORE_OWNER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Store Owner",
      user: req.user,
    });
  }
);

export default router;