import Product from "../models/Product.js";
import Category from "../models/Category.js";

import { AppError, asyncHandler } from "../utils/appError.js";

/**
 * Get Products
 */
export const getProducts = asyncHandler(async (req, res, next) => {
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

  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });

    if (!categoryDoc) {
      return next(new AppError("Category not found", 404));
    }

    query.category = categoryDoc._id;
  }

  // Brand filter
  if (brand) {
    query.brand = new RegExp(brand, "i");
  }

  // Prescription filter
  if (requiresPrescription !== undefined) {
    query.requiresPrescription = requiresPrescription === "true";
  }

  // Flags
  if (isFeatured) query.isFeatured = true;
  if (isBestSeller) query.isBestSeller = true;
  if (isNewArrival) query.isNewArrival = true;

  // Price filter
  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Search
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

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get Single Product
 */
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { slug: req.params.id },
      {
        _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null,
      },
    ],
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

/**
 * Create Product
 */
// export const createProduct = asyncHandler(async (req, res, next) => {
//   // FormData sends JSON as string
//   const body = req.body.data ? JSON.parse(req.body.data) : req.body;

//   const files = req.files;

//   const product = await Product.create({
//     ...body,
//   });

//   res.status(201).json({
//     success: true,
//     product,
//   });
// });

export const createProduct = asyncHandler(async (req, res, next) => {
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;

  // Only check name — slug & SKU are auto-generated from it
  const existingProduct = await Product.findOne({ name: body.name });

  if (existingProduct) {
    return next(new AppError("A product with this name already exists", 400));
  }

  const product = await Product.create({ ...body });

  res
    .status(201)
    .json({ success: true, message: "Product created successfully", product });
});

/**
 * Update Product
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;

  // If name is changing, make sure new name isn't taken by another product
  if (body.name) {
    const existing = await Product.findOne({
      name: body.name,
      _id: { $ne: req.params.id }, // exclude current product
    });
    if (existing)
      return next(new AppError("A product with this name already exists", 400));
  }

  const product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({ success: true, product });
});

/**
 * Delete Product (Soft Delete)
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product removed",
  });
});

/**
 * Featured Products
 */
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isFeatured: true,
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");

  res.status(200).json({
    success: true,
    products,
  });
});

/**
 * Best Sellers
 */
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isBestSeller: true,
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");

  res.status(200).json({
    success: true,
    products,
  });
});

/**
 * Add Review
 */
export const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );

  if (alreadyReviewed) {
    return next(new AppError("Already reviewed", 400));
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });

  product.numReviews = product.reviews.length;

  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.numReviews;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review added",
  });
});
