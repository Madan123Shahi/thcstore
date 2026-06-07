import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema(
  {
    event:     { type: String, required: true, index: true }, // e.g. "page_view", "product_view", "add_to_cart"
    page:      { type: String },                              // e.g. "/products/cbd-oil"
    data:      { type: mongoose.Schema.Types.Mixed },         // any extra data
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userAgent: { type: String },
    ip:        { type: String },
  },
  { timestamps: true }
);

// ✅ Auto-delete logs older than 90 days — keeps collection lean
eventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model("EventLog", eventLogSchema);