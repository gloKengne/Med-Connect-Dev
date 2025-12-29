import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";

export const requestConnection = async (req, res) => {
  const { doctorId, recordIds } = req.body;

  const connection = await Connection.create({
    patient: req.user.id,
    doctor: doctorId,
    records: recordIds
  });

  await Notification.create({
    recipient: doctorId,
    sender: req.user.id,
    type: "CONNECTION_REQUEST",
    message: "New patient connection request",
    relatedConnection: connection._id
  });

  res.status(201).json(connection);
};



export const respondToConnection = async (req, res) => {
  const { action } = req.body;

  const connection = await Connection.findById(req.params.id);
  if (!connection) return res.status(404).json({ message: "Not found" });

  if (connection.doctor.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  connection.status = action === "accept" ? "accepted" : "rejected";
  await connection.save();

  await Notification.create({
    recipient: connection.patient,
    sender: req.user.id,
    type:
      action === "accept"
        ? "CONNECTION_ACCEPTED"
        : "CONNECTION_REJECTED",
    message:
      action === "accept"
        ? "Doctor accepted your request"
        : "Doctor rejected your request",
    relatedConnection: connection._id
  });

  res.json(connection);
};


export const getDoctorConnections = async (req, res) => {
  const connections = await Connection.find({
    doctor: req.user.id,
    status: "accepted"
  }).populate("patient", "name");

  res.json(connections);
};

