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
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ success: false, message: "Request not found" });
    if (withdraw.status !== "pending") return res.status(400).json({ success: false, message: "Already processed" });

    withdraw.status = "approved";
    withdraw.withdrawalCode = "WD" + Math.random().toString(36).substr(2, 8).toUpperCase();
    withdraw.approvedAt = new Date();
    await withdraw.save();
    res.json({ success: true, withdrawalCode: withdraw.withdrawalCode });
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
    // Find latest approved withdrawal for this user
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

export default router;