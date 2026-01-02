import Message from "../models/Message.js";
import Connection from "../models/Connection.js";

export const sendMessage = async (req, res) => {
  const { connectionId, content } = req.body;

  // 1️⃣ Check connection exists and is accepted
  const connection = await Connection.findOne({
    _id: connectionId,
    status: "accepted"
  });

  if (!connection) {
    return res.status(403).json({ message: "Messaging not allowed" });
  }

  // 2️⃣ Ensure sender is part of the connection
  const isParticipant =
    connection.patient.toString() === req.user.id ||
    connection.doctor.toString() === req.user.id;

  if (!isParticipant) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3️⃣ Identify receiver
  const receiver =
    req.user.id === connection.patient.toString()
      ? connection.doctor
      : connection.patient;

  // 4️⃣ Save message
  const message = await Message.create({
    connection: connection._id,
    sender: req.user.id,
    receiver,
    content
  });

  // 🔔 5️⃣ CREATE NOTIFICATION
  await Notification.create({
    recipient: receiver,
    sender: req.user.id,
    type: "NEW_MESSAGE",
    message: "You have a new message",
    relatedConnection: connection._id
  });

  res.status(201).json(message);
};

export const getMessages = async (req, res) => {
  const { connectionId } = req.params;

  // 1️⃣ Validate connection
  const connection = await Connection.findOne({
    _id: connectionId,
    status: "accepted"
  });

  if (!connection) {
    return res.status(403).json({ message: "Access denied" });
  }

  // 2️⃣ Ensure user belongs to the connection
  if (
    connection.patient.toString() !== req.user.id &&
    connection.doctor.toString() !== req.user.id
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3️⃣ Fetch messages
  const messages = await Message.find({ connection: connectionId })
    .sort({ createdAt: 1 });

  res.json(messages);
};
