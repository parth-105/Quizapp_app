import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Store hashed in production!
  name: { type: String, required: true }
});

export default mongoose.model("Admin", adminSchema);