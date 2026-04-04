const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  brand: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true },
  shortDescription: String,
  images: [{ url: String, alt: String }],
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true },
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
}, { timestamps: true });

// Auto-compute discount
productSchema.pre('save', function (next) {
  if (this.mrp > 0 && this.price < this.mrp) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
