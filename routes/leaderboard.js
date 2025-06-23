import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get leaderboard (sorted by points)
router.get("/", async (req, res) => {
  const users = await User.find().sort({ totalPoints: -1 }).limit(100);
  res.json(users);
});

export default router;