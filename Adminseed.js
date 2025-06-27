import mongoose from "mongoose";
import Admin from "./models/Admin.js";

const MONGO_URL = "mongodb+srv://admin1:x36uB1XwqcSZImZ0@cluster0.lmbvy.mongodb.net/";

async function seedAdmin() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  // Example admin data
  const admin = {
    name: "Super Admin",
    email: "admin@example.com",
    password: "admin123", // In production, use a hashed password!
  };

  // Remove existing admin with same email
  await Admin.deleteOne({ email: admin.email });

  // Create new admin
  await Admin.create(admin);

  console.log("Admin user seeded!");
  mongoose.disconnect();
}

seedAdmin();