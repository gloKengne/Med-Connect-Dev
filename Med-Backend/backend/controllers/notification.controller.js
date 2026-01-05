// backend/controllers/notification.controller.js
import Notification from "../models/Notification.js";

// Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .populate("sender", "firstName lastName")
    .populate({
      path: "relatedConnection",
      select: "_id status patient doctor",
      populate: [
        { path: "patient", select: "firstName lastName" },
        { path: "doctor", select: "firstName lastName" }
      ]
    })
    .populate({
      path: "relatedAppointment",
      select: "_id status date startTime endTime type patient doctor",
      populate: [
        { path: "patient", select: "firstName lastName" },
        { path: "doctor", select: "firstName lastName specialty" }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications" 
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch unread count" 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      { isRead: true },
      { new: true }
    )
    .populate("sender", "firstName lastName")
    .populate({
      path: "relatedConnection",
      select: "_id status patient doctor"
    })
    .populate({
      path: "relatedAppointment",
      select: "_id status date startTime endTime type"
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark notification as read" 
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark all as read" 
    });
  }
};