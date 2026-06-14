import User from "../models/User.js";
import LoyaltyTransaction from "../models/LoyaltyTransaction.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { redeemPoints, POINTS_CONFIG } from "../services/loyaltyService.js";

// ─────────────────────────────────────────────
// @desc    Get current user's loyalty summary
// @route   GET /api/loyalty
// @access  Private
// ─────────────────────────────────────────────
export const getLoyaltySummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "loyaltyPoints totalPointsEarned referralCode"
  );

  const transactions = await LoyaltyTransaction.find({ user: req.user._id })
    .sort("-createdAt")
    .limit(20);

  const discountValue = Math.floor(user.loyaltyPoints / POINTS_CONFIG.REDEEM_RATE);

  res.json({
    loyaltyPoints: user.loyaltyPoints,
    totalPointsEarned: user.totalPointsEarned,
    referralCode: user.referralCode,
    discountValue, // ₹ value if all points redeemed
    minRedeemPoints: POINTS_CONFIG.MIN_REDEEM,
    freeShippingPoints: POINTS_CONFIG.FREE_SHIPPING_POINTS,
    canRedeem: user.loyaltyPoints >= POINTS_CONFIG.MIN_REDEEM,
    transactions,
  });
});

// ─────────────────────────────────────────────
// @desc    Redeem points for discount on an order
// @route   POST /api/loyalty/redeem
// @access  Private
// body: { points, orderId, redeemType: "discount" | "shipping" }
// ─────────────────────────────────────────────
export const redeemLoyaltyPoints = asyncHandler(async (req, res) => {
  const { points, orderId, redeemType } = req.body;

  if (!points || points <= 0) throw new AppError("Invalid points amount", 400);
  if (!["discount", "shipping"].includes(redeemType))
    throw new AppError("Invalid redeem type", 400);

  const type = redeemType === "discount" ? "redeemed_discount" : "redeemed_shipping";
  const description =
    redeemType === "discount"
      ? `Redeemed ${points} points for ₹${Math.floor(points / POINTS_CONFIG.REDEEM_RATE)} discount`
      : `Redeemed ${points} points for free shipping`;

  const { discountAmount, remainingPoints } = await redeemPoints({
    userId: req.user._id,
    points,
    type,
    description,
    orderId,
  });

  res.json({
    message: "Points redeemed successfully",
    discountAmount,
    remainingPoints,
  });
});

// ─────────────────────────────────────────────
// @desc    Apply referral code at registration
// @route   POST /api/loyalty/referral/apply
// @access  Private (called after register)
// body: { referralCode }
// ─────────────────────────────────────────────
export const applyReferralCode = asyncHandler(async (req, res) => {
  const { referralCode } = req.body;
  if (!referralCode) throw new AppError("Referral code is required", 400);

  const currentUser = await User.findById(req.user._id);
  if (currentUser.referredBy) throw new AppError("Referral code already applied", 400);

  const referrer = await User.findOne({
    referralCode: referralCode.toUpperCase(),
  });
  if (!referrer) throw new AppError("Invalid referral code", 404);
  if (referrer._id.toString() === req.user._id.toString())
    throw new AppError("You cannot use your own referral code", 400);

  currentUser.referredBy = referrer._id;
  await currentUser.save();

  res.json({
    message: "Referral code applied successfully! You'll earn bonus points on your first order.",
    referredBy: referrer.name,
  });
});

// ─────────────────────────────────────────────
// @desc    Get all users' loyalty (admin)
// @route   GET /api/loyalty/admin
// @access  Admin
// ─────────────────────────────────────────────
export const adminGetAllLoyalty = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name email loyaltyPoints totalPointsEarned referralCode createdAt")
    .sort("-loyaltyPoints");

  res.json(users);
});

// ─────────────────────────────────────────────
// @desc    Admin manually adjust points
// @route   POST /api/loyalty/admin/adjust
// @access  Admin
// body: { userId, points, description }
// ─────────────────────────────────────────────
export const adminAdjustPoints = asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  if (!userId || points === undefined || !description)
    throw new AppError("userId, points and description are required", 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.loyaltyPoints = Math.max(0, user.loyaltyPoints + points);
  if (points > 0) user.totalPointsEarned += points;
  await user.save();

  await LoyaltyTransaction.create({
    user: userId,
    type: "admin_adjustment",
    points,
    balanceAfter: user.loyaltyPoints,
    description,
  });

  res.json({
    message: "Points adjusted",
    loyaltyPoints: user.loyaltyPoints,
  });
});
