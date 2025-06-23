import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
  totalPoints: { type: Number, default: 0 },
  referralCode: String,
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hasUsedReferralCode: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);