import express from "express";
import { getDoctors } from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("patient"), getDoctors);

export default router;
