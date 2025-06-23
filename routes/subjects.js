import express from "express";
import Subject from "../models/Subject.js";

const router = express.Router();

// Get all subjects (with topics and questions)
router.get("/", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

// Create a subject
router.post("/", async (req, res) => {
  const subject = await Subject.create(req.body);
  res.json(subject);
});

// Add a topic to a subject
router.post("/:subjectId/topics", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  subject.topics.push(req.body);
  await subject.save();
  res.json(subject);
});

// Add a question to a topic
router.post("/:subjectId/topics/:topicIndex/questions", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  subject.topics[req.params.topicIndex].questions.push(req.body);
  await subject.save();
  res.json(subject);
});

export default router;