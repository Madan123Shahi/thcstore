/**
 * backend/middleware/validate.js
 *
 * Drop-in Zod validation middleware for Express.
 * Validates req.body (or req.query) against any Zod schema
 * from shared/schemas/ and calls next() on success,
 * or passes a structured ZodError to errorMiddleware on failure.
 */

/**
 * Validates req.body against a Zod schema.
 * On success: replaces req.body with the parsed (and transformed) value.
 * On failure: calls next(err) — caught by errorMiddleware → 422 response.
 *
 * @param {import('zod').ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    req.body = result.data; // use the parsed/transformed data (e.g. trimmed, lowercased)
    return next();
  }
  next(result.error); // ZodError → errorMiddleware
};

/**
 * Validates req.query (search params, filters) against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (result.success) {
    req.query = result.data;
    return next();
  }
  next(result.error);
};
