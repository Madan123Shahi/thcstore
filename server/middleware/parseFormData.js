// middleware/parseFormData.js
import { AppError } from "../utils/appError.js";

export function parseFormData(req, res, next) {
  try {
    req.body = req.body.data ? JSON.parse(req.body.data) : req.body;
    next();
  } catch {
    next(new AppError("Invalid JSON in request body", 400));
  }
}
