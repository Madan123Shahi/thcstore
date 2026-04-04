// userRoutes.js
import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

router.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.json(users);
  }),
);

router.get(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }),
);

router.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    res.json(user);
  }),
);

export default router;
