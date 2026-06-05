import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeatured,
  getBestSellers,
  addReview,
} from "../controllers/productController.js";
import { uploadProduct } from "../middleware/upload.js";
import { parseFormData } from "../middleware/parseFormData.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  addReviewSchema,
  createProductSchema,
  getProductsSchema,
  updateProductSchema,
} from "../../shared/schemas/product.schema.js";

router.get("/", validateQuery(getProductsSchema), getProducts);
router.get("/featured", getFeatured);
router.get("/bestsellers", getBestSellers);
router.get("/:id", getProduct);
router.post(
  "/",
  protect,
  admin,
  uploadProduct,
  validate(createProductSchema),
  parseFormData,
  createProduct,
);

router.put(
  "/:id",
  protect,
  admin,
  uploadProduct,
  validate(updateProductSchema),
  updateProduct,
);

router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, validate(addReviewSchema), addReview);

export default router;
