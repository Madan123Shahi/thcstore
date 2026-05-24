/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // distinguishes expected errors from programming bugs
    // this.errors = errors; // optional field-level validation errors (from Zod)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * asyncHandler wraps async route handlers to avoid repetitive try/catch.
 * Any thrown error is forwarded to the centralized error middleware via next().
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
