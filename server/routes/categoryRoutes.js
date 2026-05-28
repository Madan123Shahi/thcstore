import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../shared/schemas/category.schema.js";

router.post("/", validate(createCategorySchema), createCategory);
router.put("/:id", validate(updateCategorySchema), updateCategory);

router.get("/", getCategories);
router.get("/:slug", getCategory);
router.post(
  "/",
  protect,
  admin,
  validate(createCategorySchema),
  createCategory,
);
router.put(
  "/:id",
  protect,
  admin,
  validate(updateCategorySchema),
  updateCategory,
);
router.delete("/:id", protect, admin, deleteCategory);

export default router;
