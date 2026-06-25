import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { AppError, asyncHandler } from "../utils/appError.js";
import { getResponsiveUrls } from "../middleware/upload.js";
import Order from "../models/Order.js";
import { handleReviewLoyalty } from "../services/loyaltyService.js";

/**
 * Get Products — with Atlas Search if search param provided
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    sort,
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

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 20, 1);

  // ✅ Use Atlas Search when search query is provided
  if (search) {
    const pipeline = [
      {
        $search: {
          index: "default", // ✅ your Atlas Search index name
          compound: {
            must: [
              {
                // ✅ fuzzy — tolerates typos ("CBD oel" finds "CBD oil")
                text: {
                  query: search,
                  path: ["name", "brand", "description", "tags"],
                  fuzzy: { maxEdits: 1, prefixLength: 2 },
                },
              },
            ],
            filter: [{ equals: { path: "isActive", value: true } }],
          },
        },
      },
      // ✅ Apply additional filters on top of search
      ...(category
        ? [
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryData",
              },
            },
            {
              $match: { "categoryData.slug": category },
            },
          ]
        : []),
      ...(minPrice || maxPrice
        ? [
            {
              $match: {
                price: {
                  ...(minPrice && { $gte: Number(minPrice) }),
                  ...(maxPrice && { $lte: Number(maxPrice) }),
                },
              },
            },
          ]
        : []),
      ...(brand
        ? [{ $match: { brand: new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } }]
        : []),
      ...(requiresPrescription !== undefined
        ? [{ $match: { requiresPrescription: requiresPrescription === "true" } }]
        : []),
      ...(isFeatured ? [{ $match: { isFeatured: true } }] : []),
      ...(isBestSeller ? [{ $match: { isBestSeller: true } }] : []),
      ...(isNewArrival ? [{ $match: { isNewArrival: true } }] : []),

      // ✅ Add search score for relevance sorting
      { $addFields: { score: { $meta: "searchScore" } } },

      // Count total before pagination
      {
        $facet: {
          metadata: [{ $count: "total" }],
          products: [
            { $sort: { score: -1 } }, // ✅ sort by relevance
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { reviews: 0 } }, // exclude reviews
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: { path: "$category", preserveNullAndEmpty: true } },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);
    const total = result.metadata[0]?.total || 0;
    const products = result.products || [];

    return res.status(200).json({
      success: true,
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // ── Regular MongoDB query (no search term) ────────────────────────────────
  const query = { isActive: true };

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) throw new AppError("Category not found", 404);
    query.category = categoryDoc._id;
  }
  if (brand) {
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.brand = new RegExp(escapedBrand, "i");
  }
  if (requiresPrescription !== undefined)
    query.requiresPrescription = requiresPrescription === "true";
  if (isFeatured) query.isFeatured = true;
  if (isBestSeller) query.isBestSeller = true;
  if (isNewArrival) query.isNewArrival = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-reviews");

  res.status(200).json({
    success: true,
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─────────────────────────────────────────────
// @desc    Autocomplete search suggestions
// @route   GET /api/products/autocomplete?q=cbd
// @access  Public
// ─────────────────────────────────────────────
export const autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ suggestions: [] });

  const pipeline = [
    {
      $search: {
        index: "product", // ✅ your autocomplete index name
        compound: {
          should: [
            {
              autocomplete: {
                query: q,
                path: "name",
                fuzzy: { maxEdits: 1 },
              },
            },
            {
              autocomplete: {
                query: q,
                path: "brand",
                fuzzy: { maxEdits: 1 },
              },
            },
          ],
          filter: [{ equals: { path: "isActive", value: true } }],
        },
      },
    },
    { $limit: 6 }, // ✅ only 6 suggestions in dropdown
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        slug: 1,
        price: 1,
        image: { $arrayElemAt: ["$images.thumbnail", 0] },
        score: { $meta: "searchScore" },
      },
    },
  ];

  const suggestions = await Product.aggregate(pipeline);
  res.json({ suggestions });
});

/**
 * Get Single Product
 */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [
      { slug: req.params.id },
      { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
    ],
    isActive: true,
  }).populate("category", "name slug");

  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json({ success: true, product });
});

/**
 * Create Product
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    category,
    brand,
    tags,
    requiresPrescription,
    isFeatured,
    isBestSeller,
    isNewArrival,
  } = req.body;

  const existingProduct = await Product.findOne({ name });
  if (existingProduct) throw new AppError("Product already exists", 400);

  const uploadedImages = (req.files || []).map((file) => {
    const publicId = file.filename;
    const urls = getResponsiveUrls(publicId);
    return {
      url: file.path,
      thumbnail: urls.thumbnail,
      medium: urls.medium,
      large: urls.large,
      alt: name,
    };
  });

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    brand,
    tags,
    requiresPrescription,
    isFeatured,
    isBestSeller,
    isNewArrival,
    images: uploadedImages,
  });

  res.status(201).json({ success: true, message: "Product created", product });
});

/**
 * Update Product
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    category,
    brand,
    tags,
    requiresPrescription,
    isFeatured,
    isBestSeller,
    isNewArrival,
    existingImages,
  } = req.body;

  if (name) {
    const existing = await Product.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) throw new AppError("Product name already exists", 400);
  }

  const uploadedImages = (req.files || []).map((file) => {
    const publicId = file.filename;
    const urls = getResponsiveUrls(publicId);
    return {
      url: file.path,
      thumbnail: urls.thumbnail,
      medium: urls.medium,
      large: urls.large,
      alt: name || "",
    };
  });

  const images = [...(existingImages || []), ...uploadedImages];
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      price,
      stock,
      category,
      brand,
      tags,
      requiresPrescription,
      isFeatured,
      isBestSeller,
      isNewArrival,
      images,
    },
    { new: true, runValidators: true }
  );

  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json({ success: true, product });
});

/**
 * Delete Product (Soft Delete)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json({ success: true, message: "Product removed" });
});

/**
 * Featured Products
 */
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");
  res.status(200).json({ success: true, products });
});

/**
 * Best Sellers
 */
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .select("-reviews");
  res.status(200).json({ success: true, products });
});

/**
 * Add Review
 */
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new AppError("Already reviewed", 400);

  // ── Verify user has actually ordered this product ───────────────────────
  // Prevents fake reviews from users who never bought the product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    "items.product": product._id,
    orderStatus: { $in: ["delivered", "confirmed"] },
  });
  if (!hasPurchased) throw new AppError("You can only review products you have purchased", 403);

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.numReviews;

  await product.save();

  // ── Award loyalty points for leaving a review — non-blocking ────────────
  handleReviewLoyalty({
    userId: req.user._id,
    productId: product._id,
    orderId: hasPurchased._id,
  }).catch(console.error);

  res.status(201).json({ success: true, message: "Review added" });
});
