import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "../routes/users.js";
import subjectsRouter from "../routes/subjects.js";
import leaderboardRouter from "../routes/leaderboard.js";
import withdrawalsRouter from "../routes/withdrawals.js";
import adminRouter from "../routes/admin.js";
import couponsRouter from "../routes/coupons.js";
import cron from "node-cron";
import { resetLeaderboardAndRewardPodium } from "../cron/leaderboardReset.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/users", usersRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/withdrawal-requests", withdrawalsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/coupons", couponsRouter);

app.get("/", (req, res) => res.send("Quiz API running"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Every Sunday at midnight
cron.schedule("0 0 * * 0", resetLeaderboardAndRewardPodium);

export default app;