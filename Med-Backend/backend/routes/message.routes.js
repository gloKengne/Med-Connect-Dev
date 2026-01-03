import express from "express";
import authMiddle from "../middleware/authMiddle.js";  
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Send a message
router.post("/", authMiddle, sendMessage);

// Get all conversations
router.get("/conversations", authMiddle, getConversations);

// Get messages for a specific connection
router.get("/connection/:connectionId", authMiddle, getMessages);

// Mark messages as read
router.patch("/connection/:connectionId/read", authMiddle, markAsRead);

// Get unread message count
router.get("/unread-count", authMiddle, getUnreadCount);

// Delete a message
router.delete("/:messageId", authMiddle, deleteMessage);

export default router;