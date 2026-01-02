import express from "express";
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientById
} from "../controllers/patient-profile.controller.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

// Patient routes
router.get("/profile", authMiddle, getPatientProfile);
router.put("/profile", authMiddle, updatePatientProfile);

// Doctor can view patient details
router.get("/:id", authMiddle, getPatientById);

export default router;