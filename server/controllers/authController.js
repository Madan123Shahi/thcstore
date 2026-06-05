import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js"; // ✅ your custom utils

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// Helper to set the cookie and respond
const sendTokenCookie = (res, statusCode, user, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  });

  res.status(statusCode).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, dob } = req.body;
  const uploadDL = req.file;

  if (!name || !email || !password || !phone || !dob || !uploadDL)
    throw new AppError(
      "Name, email, password, phone number, date of birth and driver license are required",
      400,
    );

  const exists = await User.findOne({ $or: [{ email }, { phone }] });

  if (exists) {
    throw new AppError(
      exists.email === email
        ? "Email already registered"
        : "Phone number already registered",
      400,
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    dob,
    uploadDL: uploadDL.path, // ✅ Cloudinary URL
  });

  const token = signToken(user._id);
  sendTokenCookie(res, 201, user, token);
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password)
    throw new AppError("Email/Phone and password are required", 400);

  // ✅ Type check to nullify NoSQL injection
  if (typeof emailOrPhone !== "string" || typeof password !== "string")
    throw new AppError("Invalid input", 400);

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");

  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const token = signToken(user._id);
  sendTokenCookie(res, 200, user, token);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name images price",
  );
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, dateOfBirth },
    { new: true, runValidators: true },
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

export const addAddress = asyncHandler(async (req, res) => {
  const { label, name, line1, line2, city, state, pincode, phone, isDefault } =
    req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);

  // ✅ Reset other defaults if this is the new default
  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  // ✅ Only explicitly named fields pushed — injection safe
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
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
});
