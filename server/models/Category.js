import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // ✅ unique:true creates index
    slug: { type: String, unique: true }, // ✅ unique:true creates index — no schema.index() needed
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
// ✅ Only non-unique compound index here
// slug is already indexed via unique:true above
// ─────────────────────────────────────────────
categorySchema.index({ isActive: 1, sortOrder: 1 }); // category listing query

categorySchema.pre("save", function (next) {
  if (!this.slug)
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  next();
});

export default mongoose.model("Category", categorySchema);
