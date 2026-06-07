import Coupon from "../models/Coupon.js";
import { asyncHandler, AppError } from "../utils/appError.js";

// ─────────────────────────────────────────────
// @desc    Validate coupon at checkout
// @route   POST /api/coupons/validate
// @access  Private
// ─────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal, shippingPrice } = req.body;

  if (!code) throw new AppError("Coupon code is required", 400);

  // ✅ Always uppercase for comparison
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) throw new AppError("Invalid coupon code", 404);

  // ✅ Check validity
  const { valid, message } = coupon.isValid(orderTotal);
  if (!valid) throw new AppError(message, 400);

  // ✅ Calculate discount
  const discountAmount = coupon.calculateDiscount(orderTotal, shippingPrice);

  res.json({
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      description: coupon.description,
    },
    discountAmount: Math.round(discountAmount),
    message: `Coupon applied! You save ₹${Math.round(discountAmount)}`,
  });
});

// ─────────────────────────────────────────────
// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Admin
// ─────────────────────────────────────────────
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.json(coupons);
});

// ─────────────────────────────────────────────
// @desc    Create coupon (admin)
// @route   POST /api/coupons
// @access  Admin
// ─────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    value,
    minOrder,
    maxDiscount,
    expiry,
    usageLimit,
    description,
  } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) throw new AppError("Coupon code already exists", 400);

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    value,
    minOrder,
    maxDiscount,
    expiry,
    usageLimit,
    description,
  });

  res.status(201).json(coupon);
});

// ─────────────────────────────────────────────
// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
// @access  Admin
// ─────────────────────────────────────────────
export const updateCoupon = asyncHandler(async (req, res) => {
  const {
    discountType,
    value,
    minOrder,
    maxDiscount,
    expiry,
    usageLimit,
    description,
    isActive,
  } = req.body;

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      discountType,
      value,
      minOrder,
      maxDiscount,
      expiry,
      usageLimit,
      description,
      isActive,
    },
    { new: true, runValidators: true },
  );

  if (!coupon) throw new AppError("Coupon not found", 404);
  res.json(coupon);
});

// ─────────────────────────────────────────────
// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
// ─────────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError("Coupon not found", 404);
  res.json({ message: "Coupon deleted" });
});

// ─────────────────────────────────────────────
// @desc    Toggle coupon active status (admin)
// @route   PATCH /api/coupons/:id/toggle
// @access  Admin
// ─────────────────────────────────────────────
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError("Coupon not found", 404);
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json(coupon);
});
