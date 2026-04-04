const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name');
  res.json(categories);
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});
