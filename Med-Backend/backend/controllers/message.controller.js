import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/messages/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
}).single("attachment");

// Send message
export const sendMessage = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      const { connectionId, content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "Message content is required" 
        });
      }

      // 1️⃣ Check connection exists and is accepted
      const connection = await Connection.findOne({
        _id: connectionId,
        status: "accepted"
      }).populate('patient doctor', 'firstName lastName');

      if (!connection) {
        return res.status(403).json({ 
          success: false, 
          message: "Messaging not allowed - connection not found or not accepted" 
        });
      }

      // 2️⃣ Ensure sender is part of the connection
      const isParticipant =
        connection.patient._id.toString() === req.user.id ||
        connection.doctor._id.toString() === req.user.id;

      if (!isParticipant) {
        return res.status(403).json({ 
          success: false, 
          message: "You are not part of this conversation" 
        });
      }

      // 3️⃣ Identify receiver
      const receiver =
        req.user.id === connection.patient._id.toString()
          ? connection.doctor._id
          : connection.patient._id;

      // 4️⃣ Prepare message data
      const messageData = {
        connection: connection._id,
        sender: req.user.id,
        receiver,
        content: content.trim(),
        isRead: false
      };

      // Add attachment info if file was uploaded
      if (req.file) {
        messageData.hasAttachment = true;
        messageData.attachmentName = req.file.originalname;
        messageData.attachmentUrl = `/uploads/messages/${req.file.filename}`;
      }

      // 5️⃣ Save message
      const message = await Message.create(messageData);

      // 6️⃣ Create notification for receiver
      await Notification.create({
        recipient: receiver,
        sender: req.user.id,
        type: "NEW_MESSAGE",
        message: `You have a new message`,
        relatedConnection: connection._id
      });

      res.status(201).json({ 
        success: true, 
        message: message 
      });
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error sending message", 
      error: error.message 
    });
  }
};

// Get messages for a connection
export const getMessages = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // 1️⃣ Validate connection
    const connection = await Connection.findOne({
      _id: connectionId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied - connection not found or not accepted" 
      });
    }

    // 2️⃣ Ensure user belongs to the connection
    if (
      connection.patient.toString() !== req.user.id &&
      connection.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not part of this conversation" 
      });
    }

    // 3️⃣ Fetch messages
    const messages = await Message.find({ connection: connectionId })
      .populate('sender receiver', 'firstName lastName role')
      .sort({ createdAt: 1 });

    res.json({ 
      success: true, 
      messages 
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching messages", 
      error: error.message 
    });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all accepted connections for this user
    const connections = await Connection.find({
      $or: [{ patient: userId }, { doctor: userId }],
      status: "accepted"
    })
    .populate('patient doctor', 'firstName lastName role')
    .sort({ updatedAt: -1 });

    // Build conversations with last message info
    const conversations = await Promise.all(
      connections.map(async (conn) => {
        // Determine the other participant
        const isPatient = conn.patient._id.toString() === userId;
        const participant = isPatient ? conn.doctor : conn.patient;

        // Get last message
        const lastMessage = await Message.findOne({ 
          connection: conn._id 
        })
        .sort({ createdAt: -1 })
        .limit(1);

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          connection: conn._id,
          receiver: userId,
          isRead: false
        });

        return {
          connectionId: conn._id,
          participantId: participant._id,
          participantName: `${participant.firstName} ${participant.lastName}`,
          participantRole: participant.role,
          lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
          lastMessageTime: lastMessage ? lastMessage.createdAt : conn.createdAt,
          unreadCount,
          online: false // TODO: Implement online status with WebSocket
        };
      })
    );

    res.json({ 
      success: true, 
      conversations 
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching conversations", 
      error: error.message 
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    // Validate connection
    const connection = await Connection.findOne({
      _id: connectionId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    // Ensure user belongs to the connection
    if (
      connection.patient.toString() !== userId &&
      connection.doctor.toString() !== userId
    ) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not part of this conversation" 
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        connection: connectionId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ 
      success: true, 
      message: "Messages marked as read" 
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error marking messages as read", 
      error: error.message 
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.json({ 
      success: true, 
      unreadCount 
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error getting unread count", 
      error: error.message 
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own messages" 
      });
    }

    await message.deleteOne();

    res.json({ 
      success: true, 
      message: "Message deleted" 
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting message", 
      error: error.message 
    });
  }
};
