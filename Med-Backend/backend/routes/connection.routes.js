import express from "express";
import {
  requestConnection,
  respondToConnection,
  getDoctorConnections,
  getPatientConnections,
  checkConnection,
  revokeConnection
} from "../controllers/connection.controller.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

// Patient routes
router.post("/request", authMiddle, requestConnection);
router.get("/patient", authMiddle, getPatientConnections);
router.get("/check/:doctorId", authMiddle, checkConnection);

// Doctor routes
router.patch("/:id/respond", authMiddle, respondToConnection);
router.get("/doctor", authMiddle, getDoctorConnections);

// Common routes
router.delete("/:id/revoke", authMiddle, revokeConnection);

export default router;
