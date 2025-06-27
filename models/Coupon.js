import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  amount: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiryDate: Date,
});

export default mongoose.model("Coupon", couponSchema);