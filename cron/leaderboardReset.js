import User from "../models/User.js";

export async function resetLeaderboardAndRewardPodium() {
  try {
    const users = await User.find();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate 7-day points for each user
    const usersWith7DayPoints = users.map(u => {
      const pointsHistory = (u.pointsHistory || []).filter(entry => new Date(entry.date) >= sevenDaysAgo);
      const points7Days = pointsHistory.reduce((sum, entry) => sum + entry.points, 0);
      return { user: u, points7Days };
    });

    // Sort by points7Days descending
    usersWith7DayPoints.sort((a, b) => b.points7Days - a.points7Days);

    // Apply multipliers to top 
    const multipliers = [1.5, 1.3, 1.1];
    for (let i = 0; i < 3; i++) {
      if (usersWith7DayPoints[i] && usersWith7DayPoints[i].points7Days > 0) {
        const { user, points7Days } = usersWith7DayPoints[i];
        const bonus = Math.floor(points7Days * (multipliers[i] - 1));
        user.totalPoints += bonus;
        user.lastPodiumRank = i + 1;
        user.lastPodiumBonus = bonus;
        await user.save();
      }
    }

    // Reset pointsHistory and podium info for all users not in top 3
    for (let i = 3; i < usersWith7DayPoints.length; i++) {
      const { user } = usersWith7DayPoints[i];
      user.lastPodiumRank = null;
      user.lastPodiumBonus = 0;
      await user.save();
    }

    // Optionally, clear pointsHistory for all users
    for (const { user } of usersWith7DayPoints) {
      user.pointsHistory = [];
      await user.save();
    }
  } catch (err) {
    console.error("Leaderboard reset error:", err);
  }
}