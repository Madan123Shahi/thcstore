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
import upload from "../middleware/upload.js";

router.get("/", getProducts);
router.get("/featured", getFeatured);
router.get("/bestsellers", getBestSellers);
router.get("/:id", getProduct);
router.post("/", protect, admin, upload.array("images", 10), createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, addReview);

export default router;
