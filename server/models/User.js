import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ["home", "work", "other"], default: "home" },
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
      unique: true,
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
    fcmTokens: [{ type: String }],

    // ── Loyalty & Referral ──────────────────────────────
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isReferralUsed: { type: Boolean, default: false },

    // ── Password reset ──────────────────────────────────
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// ── Auto-generate referral code on new user ─────────────
userSchema.pre("save", async function (next) {
  // Generate referral code only once for new users
  if (this.isNew && !this.referralCode) {
    this.referralCode = `THC-${this.name
      .slice(0, 3)
      .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
