import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeatured,
  getBestSellers,
  addReview,
  autocomplete, // ✅ new
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { uploadProduct } from "../middleware/upload.js";
import {
  getProductsSchema,
  createProductSchema,
  updateProductSchema,
  addReviewSchema,
} from "../../shared/schemas/product.schema.js";

const router = express.Router();

// ✅ Autocomplete — must be before /:id to avoid conflict
router.get("/autocomplete", autocomplete);

router.get("/featured",    getFeatured);
router.get("/bestsellers", getBestSellers);
router.get("/",            validateQuery(getProductsSchema), getProducts);
router.get("/:id",         getProduct);

router.post("/",     protect, admin, uploadProduct, validate(createProductSchema), createProduct);
router.put("/:id",   protect, admin, uploadProduct, validate(updateProductSchema), updateProduct);
router.delete("/:id",protect, admin,                                               deleteProduct);
router.post("/:id/reviews", protect, validate(addReviewSchema), addReview);

export default router;