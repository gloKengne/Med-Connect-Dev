// backend/controllers/appointment.controller.js
import Appointment from "../models/Appointment.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Get doctor's availability
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    console.log("📅 Getting availability for doctor:", doctorId, "Date:", date);

    // Check if patient is connected to doctor
    const connection = await Connection.findOne({
      patient: req.user.id,
      doctor: doctorId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: "You must be connected to this doctor to view availability"
      });
    }

    // Get doctor's availability schedule
    let availability = await DoctorAvailability.findOne({ doctor: doctorId });

    // Create default availability if none exists
    if (!availability) {
      availability = await DoctorAvailability.create({
        doctor: doctorId,
        schedule: {
          monday: [{ start: "09:00", end: "17:00" }],
          tuesday: [{ start: "09:00", end: "17:00" }],
          wednesday: [{ start: "09:00", end: "17:00" }],
          thursday: [{ start: "09:00", end: "17:00" }],
          friday: [{ start: "09:00", end: "17:00" }],
          saturday: [],
          sunday: []
        },
        slotDuration: 30
      });
    }

    // Get day of week from date
    const selectedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[selectedDate.getDay()];

    // Get slots for that day
    const daySlots = availability.schedule[dayName] || [];

    // Get existing appointments for that date
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] }
    });

    // Generate available time slots
    const availableSlots = [];
    
    for (const slot of daySlots) {
      const slotStart = parseTime(slot.start);
      const slotEnd = parseTime(slot.end);
      
      let currentTime = slotStart;
      
      while (currentTime + availability.slotDuration <= slotEnd) {
        const timeString = formatTime(currentTime);
        const endTimeString = formatTime(currentTime + availability.slotDuration);
        
        // Check if this slot is already booked
        const isBooked = existingAppointments.some(appt => 
          appt.startTime === timeString
        );
        
        if (!isBooked) {
          availableSlots.push({
            start: timeString,
            end: endTimeString,
            available: true
          });
        }
        
        currentTime += availability.slotDuration + availability.bufferTime;
      }
    }

    res.json({
      success: true,
      availability: {
        date,
        dayName,
        slots: availableSlots,
        slotDuration: availability.slotDuration,
        location: availability.location
      }
    });
  } catch (error) {
    console.error("❌ Error getting availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get availability"
    });
  }
};

// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, type, reason, notes } = req.body;

    console.log("📝 Booking appointment:", { doctorId, date, startTime, type });

    // Verify connection exists and is accepted
    const connection = await Connection.findOne({
      patient: req.user.id,
      doctor: doctorId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: "You must be connected to this doctor to book an appointment"
      });
    }

    // Check if slot is still available
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime,
      status: { $in: ["pending", "confirmed"] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is no longer available"
      });
    }

    // Get doctor's location for in-person appointments
    let location = "";
    if (type === "in-person") {
      const availability = await DoctorAvailability.findOne({ doctor: doctorId });
      location = availability?.location || "Doctor's Office";
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      connection: connection._id,
      date: appointmentDate,
      startTime,
      endTime,
      type,
      reason,
      notes: notes || "",
      status: "pending",
      location
    });

    // Get patient info
    const patient = await User.findById(req.user.id).select("firstName lastName");

    // Create notification for doctor
    await Notification.create({
      recipient: doctorId,
      sender: req.user.id,
      type: "APPOINTMENT_REQUEST",
      message: `${patient.firstName} ${patient.lastName} has requested an appointment on ${new Date(date).toLocaleDateString()} at ${startTime}`,
      relatedAppointment: appointment._id
    });

    // Populate appointment details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName specialty");

    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment"
    });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { patient: req.user.id };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("doctor", "firstName lastName specialty")
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error("❌ Error getting patient appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get appointments"
    });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    const query = { doctor: req.user.id };
    
    if (status) {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "firstName lastName email phone")
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error("❌ Error getting doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get appointments"
    });
  }
};

// Doctor responds to appointment request
export const respondToAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { action, rejectionReason } = req.body; // "accept" or "reject"

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Verify doctor owns this appointment
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Appointment already ${appointment.status}`
      });
    }

    // Update appointment status
    appointment.status = action === "accept" ? "confirmed" : "rejected";
    if (action === "reject" && rejectionReason) {
      appointment.cancelReason = rejectionReason;
    }
    await appointment.save();

    // Get doctor info
    const doctor = await User.findById(req.user.id).select("firstName lastName");

    // Notify patient
    await Notification.create({
      recipient: appointment.patient,
      sender: req.user.id,
      type: action === "accept" ? "APPOINTMENT_CONFIRMED" : "APPOINTMENT_REJECTED",
      message: action === "accept"
        ? `Dr. ${doctor.firstName} ${doctor.lastName} confirmed your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`
        : `Dr. ${doctor.firstName} ${doctor.lastName} declined your appointment request${rejectionReason ? `: ${rejectionReason}` : ""}`,
      relatedAppointment: appointment._id
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName specialty");

    res.json({
      success: true,
      message: `Appointment ${action}ed successfully`,
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("❌ Error responding to appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to appointment"
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Verify user is patient or doctor
    const isPatient = appointment.patient.toString() === req.user.id;
    const isDoctor = appointment.doctor.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled"
      });
    }

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancelReason = reason || "";
    appointment.cancelledBy = req.user.id;
    await appointment.save();

    // Get user info
    const user = await User.findById(req.user.id).select("firstName lastName");
    const recipientId = isPatient ? appointment.doctor : appointment.patient;

    // Notify other party
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: "APPOINTMENT_CANCELLED",
      message: `${user.firstName} ${user.lastName} cancelled the appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}${reason ? `: ${reason}` : ""}`,
      relatedAppointment: appointment._id
    });

    res.json({
      success: true,
      message: "Appointment cancelled successfully"
    });
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment"
    });
  }
};

// Helper functions
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}