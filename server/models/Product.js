import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true }, // ✅ unique:true already creates index
    brand: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    shortDescription: String,
    images: [
      {
        url: String,
        thumbnail: String,
        medium: String,
        large: String,
        alt: String,
      },
    ],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true }, // ✅ unique:true already creates index
    tags: [String],
    features: [String],
    specifications: [{ key: String, value: String }],
    thcContent: String,
    cbdContent: String,
    volume: String,
    weight: String,
    requiresPrescription: { type: Boolean, default: false },
    isAyushApproved: { type: Boolean, default: false },
    labTested: { type: Boolean, default: true },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─────────────────────────────────────────────
// ✅ Only compound/non-unique indexes here
// slug and sku are already indexed via unique:true above
// ─────────────────────────────────────────────
productSchema.index({ category: 1, price: 1 }); // filtered + sorted listing
productSchema.index({ name: 1, brand: 1 }); // search queries
productSchema.index({ isActive: 1, isFeatured: 1 }); // featured products
productSchema.index({ isActive: 1, isBestSeller: 1 }); // bestsellers
productSchema.index({ isActive: 1, isNewArrival: 1 }); // new arrivals

productSchema.pre("save", async function (next) {
  try {
    if (this.mrp > 0 && this.price < this.mrp)
      this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);

    if (!this.slug)
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (!this.sku) {
      const Category = mongoose.model("Category");
      const category = await Category.findById(this.category);
      const prefixMap = {
        "cbd-oils": "CBDO",
        "thc-gummies": "THCG",
        "vijaya-extract": "VIJA",
        "hemp-wellness": "HEMP",
        tinctures: "TINC",
        "pet-cbd": "PETC",
        capsules: "CAPS",
        topicals: "TOPO",
      };
      const prefix = prefixMap[category?.slug] || "PROD";
      const count = await mongoose
        .model("Product")
        .countDocuments({ category: this.category });
      this.sku = `${prefix}-${String(count + 1).padStart(4, "0")}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Product", productSchema);
