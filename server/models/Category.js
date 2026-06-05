import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: String,
    image: String,
    icon: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ─────────────────────────────────────────────
// ✅ Indexes
// ─────────────────────────────────────────────

// 1. Slug unique index — speeds up getCategory by slug
//    e.g. Category.findOne({ slug: req.params.slug })
categorySchema.index({ slug: 1 }, { unique: true });

// 2. Active + sort index — speeds up getCategories listing
//    e.g. Category.find({ isActive: true }).sort("sortOrder name")
categorySchema.index({ isActive: 1, sortOrder: 1 });

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
categorySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

export default mongoose.model("Category", categorySchema);
