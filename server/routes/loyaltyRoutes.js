import express from "express";
import {
  getLoyaltySummary,
  redeemLoyaltyPoints,
  applyReferralCode,
  adminGetAllLoyalty,
  adminAdjustPoints,
} from "../controllers/loyaltyController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Private routes
router.get("/", protect, getLoyaltySummary);
router.post("/redeem", protect, redeemLoyaltyPoints);
router.post("/referral/apply", protect, applyReferralCode);

// Admin routes
router.get("/admin", protect, admin, adminGetAllLoyalty);
router.post("/admin/adjust", protect, admin, adminAdjustPoints);

export default router;
