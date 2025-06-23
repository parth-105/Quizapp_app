import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "../routes/users.js";
import subjectsRouter from "../routes/subjects.js";
import leaderboardRouter from "../routes/leaderboard.js";

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

app.get("/", (req, res) => res.send("Quiz API running"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;