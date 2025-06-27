import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  amount: Number,
  expiryDate: Date,
});

export default mongoose.model("Coupon", couponSchema);