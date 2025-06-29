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
  lastSpinAt: { type: Date, default: null },
  deviceId: { type: String, unique: true, sparse: true },
  pointsHistory: [
    {
      date: String, // 'YYYY-MM-DD'
      points: Number,
    }
  ],
  nextScratchTime: { type: Date, default: null },
  scratchAdUsedDate: { type: String, default: null },
  lastPodiumRank: { type: Number, default: null },
  lastPodiumBonus: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("User", userSchema);