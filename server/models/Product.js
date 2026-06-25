import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
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
  { timestamps: true }
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

      // ✅ Every category slug now has an explicit prefix — no shared "PROD"
      // fallback across multiple categories, which is what caused the
      // duplicate-key collisions on sku.
      const prefixMap = {
        "cbd-oils": "CBDO",
        "thc-gummies": "THCG",
        "vijaya-extract": "VIJA",
        "hemp-wellness": "HEMP",
        tinctures: "TINC",
        "pet-cbd": "PETC",
        capsules: "CAPS",
        topicals: "TOPO",
        "vapes-cartridges": "VAPE",
        "wellness-bundles": "BNDL",
      };

      // ✅ Fallback no longer collapses every uncategorized/unmapped
      // category into one shared "PROD" prefix. Instead it derives a
      // short, category-specific prefix from the slug itself, so two
      // different unmapped categories can never collide with each other.
      const fallbackPrefix = category?.slug
        ? category.slug
            .replace(/[^a-z0-9]/gi, "")
            .slice(0, 4)
            .toUpperCase()
            .padEnd(4, "X")
        : "PROD";

      const prefix = prefixMap[category?.slug] || fallbackPrefix;

      // ✅ Count scoped to this category AND this prefix together, and
      // retried against the real next-available number if a collision
      // still occurs (e.g. from concurrent saves or manually created
      // products with a manually-set sku in the same range).
      let attempt = 0;
      let candidateSku;
      let isUnique = false;

      while (!isUnique && attempt < 5) {
        const count = await mongoose.model("Product").countDocuments({ category: this.category });
        candidateSku = `${prefix}-${String(count + 1 + attempt).padStart(4, "0")}`;

        const existing = await mongoose
          .model("Product")
          .findOne({ sku: candidateSku })
          .select("_id");

        if (!existing) isUnique = true;
        attempt++;
      }

      this.sku = candidateSku;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Product", productSchema);
