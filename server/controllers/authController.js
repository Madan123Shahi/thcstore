import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// Helper to set the cookie and respond
const sendTokenCookie = (res, statusCode, user, token) => {
  res.cookie("token", token, {
    httpOnly: true, // JS cannot access this cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
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
    return res.status(400).json({
      error:
        "Name, email, password, phone number, date of birth and driver license are required",
    });

  // Check existing user by email OR phone
  const exists = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (exists) {
    return res.status(400).json({
      error:
        exists.email === email
          ? "Email already registered"
          : "Phone number already registered",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    dob,
    uploadDL: uploadDL.path,
  });

  const token = signToken(user._id);

  sendTokenCookie(res, 201, user, token);
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({
      error: "Email/Phone and password are required",
    });
  }

  // Find user by email OR phone
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  // Compare password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const token = signToken(user._id);

  sendTokenCookie(res, 200, user, token);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name images price",
  );
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, dateOfBirth },
    { new: true, runValidators: true },
  );
  res.json(user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ error: "Current password incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.json(user.addresses);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
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
    expires: new Date(0), // immediately expire the cookie
  });
  res.json({ message: "Logged out successfully" });
});
