import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../utils/appError.js"; // ✅ your custom utils
import User from "../models/User.js";

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
router.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.json(users);
  }),
);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
router.get(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw new AppError("User not found", 404); // ✅ AppError instead of res.status
    res.json(user);
  }),
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
router.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    // ✅ Destructure only safe fields — never pass raw req.body to DB
    const { name, email, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isActive },
      { new: true, runValidators: true }, // ✅ added runValidators
    ).select("-password");

    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  }),
);

export default router;
