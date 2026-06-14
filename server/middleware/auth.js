import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js"; // ✅ your custom utils

// export const protect = asyncHandler(async (req, res, next) => {
//   const token = req.cookies.token; // ✅ read from httpOnly cookie

//   if (!token) throw new AppError("Not authorized, no token", 401);

//   const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ throws automatically if invalid/expired

//   const user = await User.findById(decoded.id).select("-password");
//   if (!user) throw new AppError("User no longer exists", 401); // ✅ handles deleted user edge case

//   req.user = user;
//   next();
// });

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) throw new AppError("Not authorized, no token", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Not authorized, token failed", 401);
  }

  req.user = await User.findById(decoded.id);
  if (!req.user) throw new AppError("User not found", 404);
  next();
});

export const admin = (req, res, next) => {
  if (req.user?.role !== "admin") throw new AppError("Not authorized, admin only", 403);
  next();
};

// export const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }
//   if (!token) return res.status(401).json({ error: "Not authorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     if (!req.user) return res.status(401).json({ error: "User not found" });
//     next();
//   } catch {
//     res.status(401).json({ error: "Token invalid" });
//   }
// };
