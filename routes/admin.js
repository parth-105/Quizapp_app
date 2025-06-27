import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  if (admin.password !== password)
    return res.status(401).json({ error: "Invalid credentials" });

  // In production, return a JWT token instead
  res.json({ _id: admin._id, name: admin.name, email: admin.email });
});

export default router;