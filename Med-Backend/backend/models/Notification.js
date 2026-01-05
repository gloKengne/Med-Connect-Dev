// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        "CONNECTION_REQUEST",
        "CONNECTION_ACCEPTED",
        "CONNECTION_REJECTED",
        "APPOINTMENT_REQUEST",
        "APPOINTMENT_CONFIRMED",
        "APPOINTMENT_REJECTED",
        "APPOINTMENT_CANCELLED"
      ],
      required: true
    },
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    relatedConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection"
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);