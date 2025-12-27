import express from "express";
import {
  requestConnection,
  respondToConnection,
  getDoctorConnections
} from "../controllers/connection.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("patient"), requestConnection);
router.patch("/:id/respond", protect, authorize("doctor"), respondToConnection);
router.get("/doctor", protect, authorize("doctor"), getDoctorConnections);

export default router;
