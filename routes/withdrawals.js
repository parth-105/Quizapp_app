import express from "express";
import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

// Get all withdrawal requests (admin)
router.get("/", async (req, res) => {
  try {
    const requests = await Withdraw.find()
      .populate("userId", "name email")
      .populate("couponId", "code description amount")
      .sort({ requestedAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Approve withdrawal (admin)
router.post("/:id/approve", async (req, res) => {
  try {
    const { code } = req.body;
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ success: false, message: "Request not found" });
    if (withdraw.status !== "pending") return res.status(400).json({ success: false, message: "Already processed" });

    withdraw.status = "approved";
    withdraw.couponCode = code; // Save the code entered by admin
    withdraw.approvedAt = new Date();
    await withdraw.save();

    res.json({ success: true, message: "Withdrawal approved", code });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reject withdrawal (admin)
router.post("/:id/reject", async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ success: false, message: "Request not found" });
    if (withdraw.status !== "pending") return res.status(400).json({ success: false, message: "Already processed" });

    withdraw.status = "rejected";
    withdraw.rejectedAt = new Date();
    withdraw.adminNote = req.body.adminNote || "";
    await withdraw.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/withdrawal-requests/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    if (req.query.all === "true") {
      const withdrawals = await Withdraw.find({
        userId: req.params.userId,
        status: "approved"
      })
        .sort({ approvedAt: -1 })
        .populate("couponId", "code description amount");
      return res.json({ success: true, withdrawals });
    }
    // Default: return latest approved
    const withdrawal = await Withdraw.findOne({
      userId: req.params.userId,
      status: "approved"
    })
      .sort({ approvedAt: -1 })
      .populate("couponId", "code description amount");
    if (!withdrawal)
      return res.json({ success: false, message: "No approved withdrawal found" });
    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/withdraw', async (req, res) => {
  const { userId, couponId } = req.body;
  if (!userId || !couponId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const coupon = await Coupon.findOne({ _id: couponId });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Check if user has enough points
    if (user.totalPoints < coupon.amount) {
      return res.status(400).json({ success: false, message: "Not enough points to redeem this coupon" });
    }

    // Prevent duplicate pending withdrawal for same coupon
    const existing = await Withdraw.findOne({ userId, couponId, status: "pending" });
    if (existing) return res.status(400).json({ success: false, message: "Already requested withdrawal for this coupon" });

    // Deduct points from user
    user.totalPoints -= coupon.amount;
    await user.save();

    // Create new withdraw request
    const withdrawRequest = new Withdraw({
      userId,
      couponId,
      couponCode: coupon.code,
      amount: coupon.amount,
      status: 'pending',
      requestedAt: new Date(),
    });
    await withdrawRequest.save();

    res.json({ success: true, message: 'Withdrawal request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Test route works!" });
});

export default router;