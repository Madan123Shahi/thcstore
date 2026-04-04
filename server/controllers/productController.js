import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = "-createdAt",
    category,
    search,
    minPrice,
    maxPrice,
    brand,
    requiresPrescription,
    isFeatured,
    isBestSeller,
    isNewArrival,
  } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, "i");
  if (requiresPrescription !== undefined)
    query.requiresPrescription = requiresPrescription === "true";
  if (isFeatured) query.isFeatured = true;
  if (isBestSeller) query.isBestSeller = true;
  if (isNewArrival) query.isNewArrival = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { brand: new RegExp(search, "i") },
      { tags: new RegExp(search, "i") },
    ];
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-reviews");

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [
      { slug: req.params.id },
      { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
    ],
    isActive: true,
  }).populate("category", "name slug");

  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: "Product removed" });
});

export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");
  res.json(products);
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");
  res.json(products);
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const already = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );
  if (already) return res.status(400).json({ error: "Already reviewed" });

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((a, r) => a + r.rating, 0) / product.numReviews;
  await product.save();
  res.status(201).json({ message: "Review added" });
});
