import express from "express";
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ── Customer ─────────────────────────────────
router.post("/validate", protect, validateCoupon); // POST /api/coupons/validate

// ── Admin ────────────────────────────────────
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);
router.patch("/:id/toggle", protect, admin, toggleCoupon);

export default router;
