import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from "../controllers/notification.controller.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

router.get("/", authMiddle, getNotifications);
router.get("/unread-count", authMiddle, getUnreadCount);
router.patch("/:id/read", authMiddle, markAsRead);
router.patch("/mark-all-read", authMiddle, markAllAsRead); 

export default router;
