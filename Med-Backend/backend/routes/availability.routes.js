// backend/routes/availability.routes.js
import express from "express";
import {
  getAvailabilitySettings,
  updateAvailabilitySettings,
  updateDaySchedule
} from "../controllers/availability.controller.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

// Doctor availability management
router.get("/settings", authMiddle, getAvailabilitySettings);
router.put("/settings", authMiddle, updateAvailabilitySettings);
router.patch("/settings/day", authMiddle, updateDaySchedule);

export default router;