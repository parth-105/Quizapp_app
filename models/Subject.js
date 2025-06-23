import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  points: Number
});

const topicSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [questionSchema]
});

const subjectSchema = new mongoose.Schema({
  title: String,
  icon: String,
  color: String,
  topics: [topicSchema]
});

export default mongoose.model("Subject", subjectSchema);