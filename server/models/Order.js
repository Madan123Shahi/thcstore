import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true }, // ✅ unique:true already creates index
    items: [orderItemSchema],
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      default: "cod",
    },
    paymentIntentId: {
      type: String,
      unique: true, // ✅ unique:true already creates index
      sparse: true, // ✅ allows multiple nulls for COD orders
    },
    paymentResult: {
      status: String,
      amount: Number,
      currency: String,
      update_time: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    prescriptionVerified: { type: Boolean, default: false },
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true },
);

// ─────────────────────────────────────────────
// ✅ Only non-unique compound indexes here
// orderNumber and paymentIntentId already indexed via unique:true above
// ─────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 }); // "My Orders" query
orderSchema.index({ orderStatus: 1 }); // admin filter by status

orderSchema.pre("save", function (next) {
  if (!this.orderNumber)
    this.orderNumber = "THC" + Date.now() + Math.floor(Math.random() * 1000);
  next();
});

export default mongoose.model("Order", orderSchema);
