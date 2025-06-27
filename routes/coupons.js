import express from "express";
import Coupon from "../models/Coupon.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Only show unexpired coupons
    const coupons = await Coupon.find();
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;