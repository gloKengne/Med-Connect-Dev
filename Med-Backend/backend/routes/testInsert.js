import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/add-test-user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Dr. John",
      email: "drjohn@example.com",
      password: "12345",
      role: "doctor"
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
