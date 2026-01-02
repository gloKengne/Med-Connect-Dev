import express from "express";
import { updateDoctorProfile, completeOnboarding } from "../controllers/doctor-profile.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Use the protect middleware consistently
router.patch("/profile", authMiddleware, updateDoctorProfile);
router.patch("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;