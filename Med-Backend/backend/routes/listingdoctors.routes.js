import express from "express";
import { getAllDoctors, getDoctorById } from "../controllers/listingdoctors.controller.js";
import authMiddle from "../middleware/authMiddle.js";
import { updateDoctorProfile, completeOnboarding } from "../controllers/doctor-profile.controller.js";


const router = express.Router();

router.get("/", authMiddle, getAllDoctors);
router.get("/:id", authMiddle, getDoctorById);

// Doctor-only routes (for updating their own profile)
router.patch("/profile", authMiddle, updateDoctorProfile);
router.patch("/complete-onboarding", authMiddle, completeOnboarding);

export default router;