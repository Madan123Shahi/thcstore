import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../services/emailService.js";
import { PASSWORD_RESET_EXPIRES } from "../../shared/constants.js";

const signAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const sendAuthResponse = (res, statusCode, user, accessToken, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth", // restrict cookie to auth routes only
  });

  res.status(statusCode).json({
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("No refresh token provided", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 403);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User not found", 404);

  const accessToken = signAccessToken(user._id);
  res.json({ accessToken });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, dob } = req.body;
  const uploadDL = req.file;

  if (!name || !email || !password || !phone || !dob || !uploadDL)
    throw new AppError(
      "Name, email, password, phone number, date of birth and driver license are required",
      400
    );

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) {
    throw new AppError(
      exists.email === email ? "Email already registered" : "Phone number already registered",
      400
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    dob,
    uploadDL: uploadDL.path,
  });

  // ✅ Send welcome email — don't await, non-blocking
  sendWelcomeEmail(user).catch(console.error);

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  sendAuthResponse(res, 201, user, accessToken, refreshToken);
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) throw new AppError("Email/Phone and password are required", 400);

  if (typeof emailOrPhone !== "string" || typeof password !== "string")
    throw new AppError("Invalid input", 400);

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");

  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  sendAuthResponse(res, 201, user, accessToken, refreshToken);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name images price");
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, dateOfBirth },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new AppError("User not found", 404);
  if (!(await user.matchPassword(currentPassword)))
    throw new AppError("Current password incorrect", 400);
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

// ─────────────────────────────────────────────
// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // ✅ Always return success — don't reveal if email exists (security)
  if (!user) {
    return res.json({
      message: "If that email exists, a reset link has been sent.",
    });
  }

  // ✅ Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // ✅ Save hashed token + expiry to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + PASSWORD_RESET_EXPIRES; // 1 hour
  await user.save({ validateBeforeSave: false });

  // ✅ Send reset email with plain token (not hashed)
  const sent = await sendPasswordResetEmail(user, resetToken);

  if (!sent) {
    // Rollback if email failed
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Failed to send reset email. Try again later.", 500);
  }

  res.json({ message: "If that email exists, a reset link has been sent." });
});

// ─────────────────────────────────────────────
// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) throw new AppError("New password is required", 400);

  // ✅ Hash the incoming token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // ✅ not expired
  });

  if (!user) throw new AppError("Invalid or expired reset token", 400);

  // ✅ Update password and clear reset fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // ✅ Log user in automatically after reset
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  sendAuthResponse(res, 201, user, accessToken, refreshToken);
});

// ─────────────────────────────────────────────
// @desc    Save FCM token for push notifications
// @route   POST /api/auth/fcm-token
// @access  Private
// ─────────────────────────────────────────────
export const saveFCMToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError("FCM token is required", 400);
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { fcmTokens: token },
  });
  res.json({ message: "FCM token saved" });
});

export const addAddress = asyncHandler(async (req, res) => {
  const { label, name, line1, line2, city, state, pincode, phone, isDefault } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push({
    label,
    name,
    line1,
    line2,
    city,
    state,
    pincode,
    phone,
    isDefault,
  });
  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);
  const pid = req.params.productId;
  const idx = user.wishlist.findIndex((id) => id.toString() === pid);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(pid);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
});
