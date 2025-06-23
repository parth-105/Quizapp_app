import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Subject from "./models/Subject.js";

dotenv.config();

const MONGO_URL = "mongodb+srv://admin1:x36uB1XwqcSZImZ0@cluster0.lmbvy.mongodb.net/"

const users = [
  {
    name: "Sarah",
    email: "sarah@example.com",
    password:"password123",
    avatar: "👩‍🎓",
    totalPoints: 1200,
    referralCode: "SARAH2024",
    referrals: [],
    hasUsedReferralCode: false,
  },
  {
    name: "Mike",
    email: "mike@example.com",
    password:"password123",
    avatar: "👨‍💻",
    totalPoints: 900,
    referralCode: "MIKE2024",
    referrals: [],
    hasUsedReferralCode: false,
  },
  {
    name: "Emma",
    email: "emma@example.com",
    password:"password123",
    avatar: "👩‍🔬",
    totalPoints: 800,
    referralCode: "EMMA2024",
    referrals: [],
    hasUsedReferralCode: false,
  },
  {
    name: "James",
    email: "james@example.com",
    password:"password123",
    avatar: "👨‍🏫",
    totalPoints: 700,
    referralCode: "JAMES2024",
    referrals: [],
    hasUsedReferralCode: false,
  },
];

const subjects = [
  {
    title: "Science",
    icon: "🔬",
    color: "#3B82F6",
    topics: [
      {
        title: "Physics",
        description: "Explore the laws of nature",
        questions: [
          {
            question: "What is the speed of light in vacuum?",
            options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "Who is known as the father of modern physics?",
            options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
            correctAnswer: 1,
            points: 10,
          },
        ],
      },
      {
        title: "Chemistry",
        description: "Test your chemistry knowledge",
        questions: [
          {
            question: "What is the chemical symbol for gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            correctAnswer: 2,
            points: 10,
          },
          {
            question: "Which gas makes up most of Earth's atmosphere?",
            options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            correctAnswer: 2,
            points: 10,
          },
        ],
      },
    ],
  },
  {
    title: "Technology",
    icon: "💻",
    color: "#10B981",
    topics: [
      {
        title: "Computers",
        description: "All about computers",
        questions: [
          {
            question: "What does CPU stand for?",
            options: [
              "Computer Processing Unit",
              "Central Processing Unit",
              "Core Processing Unit",
              "Central Program Unit",
            ],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "Which company developed the React Native framework?",
            options: ["Google", "Apple", "Facebook", "Microsoft"],
            correctAnswer: 2,
            points: 10,
          },
        ],
      },
      {
        title: "Internet",
        description: "Internet basics and history",
        questions: [
          {
            question: "What does HTTP stand for?",
            options: [
              "HyperText Transfer Protocol",
              "High Transfer Text Protocol",
              "HyperText Transport Protocol",
              "High Text Transfer Protocol",
            ],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "What does AI stand for?",
            options: [
              "Automated Intelligence",
              "Artificial Intelligence",
              "Advanced Intelligence",
              "Assisted Intelligence",
            ],
            correctAnswer: 1,
            points: 10,
          },
        ],
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  // Clear existing data
  await User.deleteMany({});
  await Subject.deleteMany({});

  // Insert users
  const createdUsers = await User.insertMany(users);

  // Insert subjects
  await Subject.insertMany(subjects);

  // Optionally, set up referrals (for demo)
  // Example: Sarah referred Mike and Emma
  const sarah = await User.findOne({ name: "Sarah" });
  const mike = await User.findOne({ name: "Mike" });
  const emma = await User.findOne({ name: "Emma" });

  if (sarah && mike && emma) {

    emma.referredBy = sarah._id;
    emma.hasUsedReferralCode = true;
    await emma.save();
  }

  console.log("Database seeded!");
  mongoose.disconnect();
}

seed();