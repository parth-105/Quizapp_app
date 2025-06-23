import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Create user
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get user by ID
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Update user points (e.g., after quiz)
router.post("/:id/points", async (req, res) => {
  const { points } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $inc: { totalPoints: points } },
    { new: true }
  );
  res.json(user);
});

// Use referral code
router.post("/:id/use-referral", async (req, res) => {
  const { referralCode } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.hasUsedReferralCode) {
    return res.status(400).json({ error: "Already used a referral code" });
  }

  const referrer = await User.findOne({ referralCode });
  if (!referrer) return res.status(400).json({ error: "Invalid referral code" });
  if (referrer._id.equals(user._id)) return res.status(400).json({ error: "Cannot use your own code" });

  user.referredBy = referrer._id;
  user.hasUsedReferralCode = true;
  user.totalPoints += 100;
  await user.save();

  referrer.referrals.push(user._id);
  referrer.totalPoints += 100;
  await referrer.save();

  res.json({ message: "Referral successful", user, referrer });
});

// Login route (by email and password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
  res.json(user);
});

export default router;