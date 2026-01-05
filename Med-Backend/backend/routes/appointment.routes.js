// backend/routes/appointment.routes.js
import express from "express";
import {
  getDoctorAvailability,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  respondToAppointment,
  cancelAppointment
} from "../controllers/appointment.controller.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

// Patient routes
router.get("/doctor/:doctorId/availability", authMiddle, getDoctorAvailability);
router.post("/book", authMiddle, bookAppointment);
router.get("/patient", authMiddle, getPatientAppointments);
router.patch("/:appointmentId/cancel", authMiddle, cancelAppointment);

// Doctor routes
router.get("/doctor", authMiddle, getDoctorAppointments);
router.patch("/:appointmentId/respond", authMiddle, respondToAppointment);

export default router;