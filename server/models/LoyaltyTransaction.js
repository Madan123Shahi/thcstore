import mongoose from "mongoose";

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "earned_purchase", // ₹1 = 1 point on every order
        "earned_first_order", // bonus on first ever order
        "earned_referral", // referrer gets points when referee places first order
        "earned_review", // points for leaving a product review
        "redeemed_discount", // points used for discount
        "redeemed_shipping", // points used for free shipping
        "expired", // points expired
        "admin_adjustment", // manual add/remove by admin
      ],
      required: true,
    },
    points: {
      type: Number,
      required: true, // positive = earned, negative = redeemed/expired
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Optional references
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

export default mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
