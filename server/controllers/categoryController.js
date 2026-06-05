import Category from "../models/Category.js";
import { asyncHandler, AppError } from "../utils/appError.js"; // ✅ your custom utils

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort(
    "sortOrder name",
  );
  res.json(categories);
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  // ✅ Type check to prevent NoSQL injection via slug param
  if (typeof req.params.slug !== "string")
    throw new AppError("Invalid slug", 400);

  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new AppError("Category not found", 404);

  res.json(category);
});

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
export const createCategory = asyncHandler(async (req, res) => {
  // ✅ Zod already validated — destructure explicit fields only (NoSQL injection safe)
  const { name, slug, description, image, isActive, sortOrder } = req.body;

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    isActive,
    sortOrder,
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req, res) => {
  // ✅ Destructure explicit fields only (NoSQL injection safe)
  const { name, slug, description, image, isActive, sortOrder } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug, description, image, isActive, sortOrder },
    { new: true, runValidators: true }, // ✅ runValidators ensures schema rules apply
  );

  if (!category) throw new AppError("Category not found", 404);
  res.json(category);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found", 404); // ✅ handle missing category

  res.json({ message: "Category deleted" });
});
