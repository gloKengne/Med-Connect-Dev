import express from "express";
import authMiddle from "../middleware/authMiddle.js";  
import {
  sendMessage,
  getMessages
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", authMiddle, sendMessage);
router.get("/:connectionId", authMiddle, getMessages);

export default router;