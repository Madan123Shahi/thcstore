import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  toggleWishlist,
} from "../controllers/authController.js";

router.post("/register", upload.single("file"), register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/address", protect, addAddress);
router.put("/wishlist/:productId", protect, toggleWishlist);

export default router;
