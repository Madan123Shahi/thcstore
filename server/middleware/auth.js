import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token; // ✅ read from httpOnly cookie

  if (!token)
    return res.status(401).json({ error: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
});

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

export const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ error: "Admin access required" });
};
