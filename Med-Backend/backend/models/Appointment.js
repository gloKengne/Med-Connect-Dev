// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true // Format: "HH:mm" e.g., "09:00"
    },
    endTime: {
      type: String,
      required: true // Format: "HH:mm" e.g., "09:30"
    },
    type: {
      type: String,
      enum: ["in-person", "video"],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending"
    },
    location: {
      type: String,
      default: ""
    },
    cancelReason: {
      type: String,
      default: ""
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Index for efficient querying
appointmentSchema.index({ doctor: 1, date: 1, status: 1 });
appointmentSchema.index({ patient: 1, date: 1, status: 1 });

export default mongoose.model("Appointment", appointmentSchema);