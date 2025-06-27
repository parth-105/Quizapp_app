import mongoose from "mongoose";
import Coupon from "./models/Coupon.js";

const MONGO_URL = "mongodb+srv://:@.lmbvy..net/";

async function seedCoupons() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  // Example coupons
  const coupons = [
    {
      code: "WELCOME100",
      description: "100 points welcome bonus",
      amount: 100,
      expirationDate: new Date("2025-12-31"),
    },
    {
      code: "SUMMER50",
      description: "50 points summer offer",
      amount: 50,
      expirationDate: new Date("2025-08-31"),
    },
    {
      code: "LUCKY10",
      description: "10 points lucky draw",
      amount: 10,
      expirationDate: new Date("2026-01-01"),
    },
  ];

  // Remove existing coupons with same codes
  for (const coupon of coupons) {
    await Coupon.deleteOne({ code: coupon.code });
    await Coupon.create(coupon);
  }

  console.log("Coupons seeded!");
  mongoose.disconnect();
}

seedCoupons();