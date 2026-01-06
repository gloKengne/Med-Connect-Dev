// backend/models/DoctorAvailability.js
import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true // Format: "HH:mm"
  },
  end: {
    type: String,
    required: true // Format: "HH:mm"
  }
});

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    schedule: {
      monday: [timeSlotSchema],
      tuesday: [timeSlotSchema],
      wednesday: [timeSlotSchema],
      thursday: [timeSlotSchema],
      friday: [timeSlotSchema],
      saturday: [timeSlotSchema],
      sunday: [timeSlotSchema]
    },
    slotDuration: {
      type: Number,
      default: 30 // Duration in minutes
    },
    location: {
      type: String,
      default: ""
    },
    bufferTime: {
      type: Number,
      default: 0 // Buffer time between appointments in minutes
    }
  },
  { timestamps: true }
);

export default mongoose.model("DoctorAvailability", availabilitySchema);