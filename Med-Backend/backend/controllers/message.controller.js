import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";

export const sendMessage = async (req, res) => {
  console.log('🚀 [sendMessage] Request received');
  console.log('📦 Body:', req.body);
  console.log('👤 User from token:', req.user ? req.user.id : 'UNDEFINED');

  try {
    const { connectionId, content } = req.body;

    if (!connectionId || !content) {
      console.log('⚠️ [sendMessage] Missing connectionId or content');
    }

    // 1️⃣ Check connection exists and is accepted
    console.log('🔍 [sendMessage] Searching for accepted connection:', connectionId);
    const connection = await Connection.findOne({
      _id: connectionId,
      status: "accepted"
    }).populate('patient doctor', 'name email');

    if (!connection) {
      console.log('❌ [sendMessage] Connection not found or not accepted');
      return res.status(403).json({ message: "Messaging not allowed" });
    }

    // 2️⃣ Ensure sender is part of the connection
    const isParticipant =
      connection.patient._id.toString() === req.user.id ||
      connection.doctor._id.toString() === req.user.id;

    console.log('👥 [sendMessage] Sender is participant:', isParticipant);

    if (!isParticipant) {
      console.log('❌ [sendMessage] Forbidden: User not part of this connection');
      return res.status(403).json({ message: "Forbidden" });
    }

    // 3️⃣ Identify receiver
    const receiver =
      req.user.id === connection.patient._id.toString()
        ? connection.doctor._id
        : connection.patient._id;
    
    console.log('📩 [sendMessage] Receiver identified as:', receiver);

    // 4️⃣ Save message
    const message = await Message.create({
      connection: connection._id,
      sender: req.user.id,
      receiver,
      content
    });
    console.log('💾 [sendMessage] Message saved to DB:', message._id);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // 5️⃣ CREATE NOTIFICATION
    await Notification.create({
      recipient: receiver,
      sender: req.user.id,
      type: "NEW_MESSAGE",
      message: "You have a new message",
      relatedConnection: connection._id
    });
    console.log('🔔 [sendMessage] Notification created');

    // 6️⃣ EMIT REAL-TIME MESSAGE
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    
    if (!io || !userSockets) {
      console.log('⚠️ [sendMessage] Socket.io or userSockets map not found on app settings');
    } else {
      const receiverSocketId = userSockets.get(receiver.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', {
          message: populatedMessage,
          connectionId: connection._id
        });
        console.log(`⚡ [sendMessage] Real-time emit to socket ${receiverSocketId}`);
      } else {
        console.log('📡 [sendMessage] Receiver not online (no socket found)');
      }
    }

    console.log('✅ [sendMessage] Success');
    res.status(201).json({ 
      success: true, 
      message: populatedMessage 
    });
  } catch (error) {
    console.error('🔥 [sendMessage] FATAL ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send message" 
    });
  }
};

export const getMessages = async (req, res) => {
  console.log('📥 [getMessages] Fetching for connection:', req.params.connectionId);
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findOne({
      _id: connectionId,
      status: "accepted"
    });

    if (!connection) {
      console.log('❌ [getMessages] Connection not found/accepted');
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (
      connection.patient.toString() !== req.user.id &&
      connection.doctor.toString() !== req.user.id
    ) {
      console.log('❌ [getMessages] User ID mismatch');
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const messages = await Message.find({ connection: connectionId })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    console.log(`✅ [getMessages] Found ${messages.length} messages`);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('🔥 [getMessages] Error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};