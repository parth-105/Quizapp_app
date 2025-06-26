import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get leaderboard (sorted by points)
router.get("/", async (req, res) => {
  const users = await User.find();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate 7-day points for each user
  const usersWith7DayPoints = users.map((u) => {
    const pointsHistory = (u.pointsHistory || []).filter(
      (entry) => new Date(entry.date) >= sevenDaysAgo
    );
    const points7Days = pointsHistory.reduce(
      (sum, entry) => sum + entry.points,
      0
    );
    return {
      ...u.toObject(),
      points7Days,
    };
  });

  // Sort by points7Days descending
  usersWith7DayPoints.sort((a, b) => b.points7Days - a.points7Days);

  res.json(usersWith7DayPoints);
});

export default router;