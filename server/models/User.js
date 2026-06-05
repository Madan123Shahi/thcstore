import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home",
  },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ✅ already creates an index
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Phone Number is required"],
    },
    uploadDL: {
      type: String,
      required: [true, "Driver License or State ID is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    dob: { type: Date, required: [true, "Date of birth is required"] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    prescriptionUploaded: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

// ─────────────────────────────────────────────
// ✅ Indexes
// email unique index is auto-created by `unique: true` above
// Explicitly defining it ensures it exists and is documented
// ─────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true }); // ✅ fast login lookup by email
userSchema.index({ phone: 1 }, { unique: true }); // ✅ fast login lookup by phone

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
