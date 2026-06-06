import { AppError } from "../utils/appError.js";

// ─────────────────────────────────────────────
// Validates req.body against a Zod schema
// Use for POST / PUT / PATCH routes
// ─────────────────────────────────────────────
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // ✅ Collect all field errors into one readable message
    const message = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return next(new AppError(message, 400));
  }

  // ✅ Replace req.body with validated + sanitized data
  req.body = result.data;
  next();
};

// ─────────────────────────────────────────────
// Validates req.query against a Zod schema
// Use for GET routes with query params
// ─────────────────────────────────────────────
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return next(new AppError(message, 400));
  }

  // ✅ Replace req.query with validated + coerced data (numbers, booleans etc.)
  req.query = result.data;
  next();
};
