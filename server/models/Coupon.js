import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // ✅ this already creates the index — no schema.index() needed
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat", "free_shipping"],
      required: true,
    },
    value: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    expiry: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true },
);

// ✅ No schema.index({ code: 1 }) — unique:true above already handles it

// ✅ Check if coupon is valid
couponSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return { valid: false, message: "Coupon is inactive" };
  if (new Date() > this.expiry)
    return { valid: false, message: "Coupon has expired" };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit)
    return { valid: false, message: "Coupon usage limit reached" };
  if (orderTotal < this.minOrder)
    return {
      valid: false,
      message: `Minimum order of ₹${this.minOrder} required`,
    };
  return { valid: true };
};

// ✅ Calculate discount amount
couponSchema.methods.calculateDiscount = function (orderTotal, shippingPrice) {
  if (this.discountType === "percentage") {
    const discount = (orderTotal * this.value) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  }
  if (this.discountType === "flat") return Math.min(this.value, orderTotal);
  if (this.discountType === "free_shipping") return shippingPrice;
  return 0;
};

export default mongoose.model("Coupon", couponSchema);
