import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  toggleWishlist,
} from "../controllers/authController.js";

import {
  registerBodySchema, // register (with confirmPassword stripped)
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  addAddressSchema,
} from "../../shared/schemas/auth.schema.js";

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
