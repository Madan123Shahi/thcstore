/**
 * backend/middleware/errorMiddleware.js
 *
 * Central error handler — must be the LAST app.use() in index.js.
 * Handles ZodError, Mongoose errors, JWT errors, and unknown errors.
 * Never leaks stack traces in production.
 */

import { ZodError } from "zod";

const errorMiddleware = (err, req, res, next) => {
  // ── Zod validation errors → 422 Unprocessable Entity ──────────────────────
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      type: "validation",
      errors: err.errors.map((e) => ({
        field: e.path.join("."), // e.g. "confirmPassword", "address.pincode"
        message: e.message,
      })),
    });
  }

  // ── JWT errors → 401 ──────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Session expired, please login again"
          : "Invalid token",
    });
  }

  // ── Mongoose duplicate key → 409 ──────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`,
    });
  }

  // ── Mongoose validation error → 400 ───────────────────────────────────────
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, type: "validation", errors });
  }

  // ── Mongoose bad ObjectId → 404 ───────────────────────────────────────────
  if (err.name === "CastError") {
    return res
      .status(404)
      .json({ success: false, message: "Resource not found" });
  }

  // ── Custom app errors (throw { statusCode, message }) ────────────────────
  if (err.statusCode) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  // ── Unknown / unexpected errors → 500 ─────────────────────────────────────
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message,
  });
};

export default errorMiddleware;
