/**
 * backend/routes/auth.routes.js
 *
 * Shows exactly how to wire shared schemas + validate middleware
 * into your existing Express routes.
 */

import express from "express";
import multer from "multer";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  toggleWishlist,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

// ── Import from the shared package ───────────────────────────────────────────
import {
  registerBodySchema, // register (with confirmPassword stripped)
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  addAddressSchema,
} from "../../shared/schemas/auth.schemas.js";

// ── Multer for DL upload (runs BEFORE Zod body validation) ───────────────────
const upload = multer({
  dest: "uploads/dl/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG, WEBP or PDF files are accepted"));
  },
});

const router = express.Router();

// Public routes
router.post(
  "/register",
  upload.single("uploadDL"), // 1. parse the file first
  validate(registerBodySchema), // 2. then validate body fields
  register,
);

router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put(
  "/password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);
router.post("/address", protect, validate(addAddressSchema), addAddress);
router.put("/wishlist/:productId", protect, toggleWishlist);
router.post("/logout", protect, logout);

export default router;
