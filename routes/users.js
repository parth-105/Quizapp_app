import express from "express";
import User from "../models/User.js";
import Coupon from "../models/Coupon";
import Withdraw from "../models/Withdraw";




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
  if (user) {
    updatePointsHistory(user, points);
    await user.save();
  }
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

  // Both users get points
  user.referredBy = referrer._id;
  user.hasUsedReferralCode = true;
  user.totalPoints += 100; // Points for the user who uses the code

  referrer.referrals.push(user._id);
  referrer.totalPoints += 100; // Points for the referrer

  await user.save();
  await referrer.save();

  res.json({
    message: `Referral successful! You and ${referrer.name} both earned 100 points!`,
    user,
    referrer,
  });
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

// Smart login/register route
router.post("/login-or-register", async (req, res) => {
  const { email, password, name, avatar, deviceId } = req.body;
  if (!email || !password || !deviceId) return res.status(400).json({ error: "Missing email, password, or device ID" });

  let user = await User.findOne({ email });

  if (user) {
    // Login flow
    if (user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
    // Optionally, block login if deviceId does not match
    if (user.deviceId && user.deviceId !== deviceId) {
      return res.status(403).json({ error: "This account is already linked to another device." });
    }
    // Optionally, update deviceId if not set
    if (!user.deviceId) {
      user.deviceId = deviceId;
      await user.save();
    }
    return res.json(user);
  } else {
    // Register flow
    // Block if deviceId is already used
    const existingDevice = await User.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ error: "This device is already registered with another account." });
    }
    const referralCode = (name || email.split("@")[0]).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    const newUser = await User.create({
      name: name || email.split("@")[0],
      email,
      password,
      avatar: avatar || "👤",
      referralCode,
      totalPoints: 0,
      referrals: [],
      hasUsedReferralCode: false,
      deviceId, // Save deviceId
    });
    return res.json(newUser);
  }
});

// Spin wheel rout
router.post("/:id/spin", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Check if 24 hours have passed since last spinn
  const now = new Date();
  if (user.lastSpinAt && now - user.lastSpinAt < 24 * 60 * 60 * 1000) {
    const nextSpin = new Date(user.lastSpinAt.getTime() + 24 * 60 * 60 * 1000);
    return res.status(400).json({ error: "You can spin again in 24 hours", nextSpin });
  }

  // Define possible rewards including new features
  const rewards = [10, 20, 5, 25, 50, 100, "spin again", "better luck next time"];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  if (reward === "spin again") {
    // Do not update lastSpinAt, allow another spin
    return res.json({
      reward,
      message: "Congratulations! You get another spin!",
      totalPoints: user.totalPoints,
      nextSpin: null
    });
  }

  if (reward === "better luck next time") {
    // Update lastSpinAt, no points awarded
    user.lastSpinAt = now;
    await user.save();
    return res.json({
      reward,
      message: "Better luck next time! No points awarded.",
      totalPoints: user.totalPoints,
      nextSpin: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
  }

  // Normal reward
  user.totalPoints += reward;
  user.lastSpinAt = now;
  await user.save();

  res.json({
    reward,
    message: `You won ${reward} points!`,
    totalPoints: user.totalPoints,
    nextSpin: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  });
});

function updatePointsHistory(user, points) {
  const todayStr = new Date().toISOString().slice(0, 10);
  user.pointsHistory = user.pointsHistory || [];
  // Keep only last 7 days
  user.pointsHistory = user.pointsHistory.filter(entry =>
    new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const todayEntry = user.pointsHistory.find(entry => entry.date === todayStr);
  if (todayEntry) {
    todayEntry.points += points;
  } else {
    user.pointsHistory.push({ date: todayStr, points });
  }
}

// Add this route to update points after spin
router.post("/:id/spin-result", async (req, res) => {
  const { reward } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const now = new Date();
  user.lastSpinAt = now;

  if (typeof reward === "number") {
    user.totalPoints += reward;
    updatePointsHistory(user, reward);
    await user.save();
    return res.json({
      reward,
      message: `You won ${reward} points!`,
      totalPoints: user.totalPoints,
      nextSpin: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
  } else if (reward === "spin again") {
    await user.save();
    return res.json({
      reward,
      message: "Congratulations! You get another spin!",
      totalPoints: user.totalPoints,
      nextSpin: null
    });
  } else if (reward === "better luck next time") {
    await user.save();
    return res.json({
      reward,
      message: "Better luck next time! No points awarded.",
      totalPoints: user.totalPoints,
      nextSpin: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
  } else {
    return res.status(400).json({ error: "Invalid reward" });
  }
});

// Refer route
router.post("/:id/refer", async (req, res) => {
  const { referralCode } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.referredBy) return res.status(400).json({ error: "Already referred" });

  const referrer = await User.findOne({ referralCode });
  if (!referrer) return res.status(404).json({ error: "Referral code not found" });

  user.referredBy = referralCode;
  user.totalPoints += 100; // or your referral bonus
  referrer.totalPoints += 100; // or your referral bonus
  await user.save();
  await referrer.save();

  res.json({ message: "Referral successful", user, referrer });
});




// GET /coupons?userId=123 - List all coupons assigned to user
router.get('/coupons', async (req, res) => {
  const { userId } = req.query;
  try {
    // Fetch coupons valid for user (e.g., belonging to user or global coupons)
    const coupons = await Coupon.find({ userId, expiryDate: { $gte: new Date() } });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// POST /withdraw - User submits withdrawal request
router.post('/withdraw', async (req, res) => {
  const { userId, couponId } = req.body;
  if (!userId || !couponId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const coupon = await Coupon.findOne({ _id: couponId, userId, expiryDate: { $gte: new Date() } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found or expired' });

    // Prevent duplicate pending withdrawal for same coupon
    const existing = await Withdraw.findOne({ userId, couponId, status: "pending" });
    if (existing) return res.status(400).json({ success: false, message: "Already requested withdrawal for this coupon" });

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


export default router;