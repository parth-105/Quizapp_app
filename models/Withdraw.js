import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
  couponCode: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  withdrawalCode: { type: String, default: null },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  adminNote: { type: String, default: "" }
});

export default mongoose.model("Withdraw", withdrawSchema);