import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user.id
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });
  res.json({ message: "Marked as read" });
};
