import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  toggleWishlist,
  logout,
  forgotPassword,
  resetPassword,
  saveFCMToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadDL } from "../middleware/upload.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../../shared/schemas/auth.schema.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────────
router.post("/register", uploadDL, validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// ── Protected ────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);
router.post("/address", protect, addAddress);
router.put("/wishlist/:productId", protect, toggleWishlist);
router.post("/fcm-token", protect, saveFCMToken);

export default router;
