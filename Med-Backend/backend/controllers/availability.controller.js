// backend/controllers/availability.controller.js
import DoctorAvailability from "../models/DoctorAvailability.js";

// Get doctor's availability settings
export const getAvailabilitySettings = async (req, res) => {
  try {
    let availability = await DoctorAvailability.findOne({ doctor: req.user.id });

    // Create default if doesn't exist
    if (!availability) {
      availability = await DoctorAvailability.create({
        doctor: req.user.id,
        schedule: {
          monday: [{ start: "09:00", end: "17:00" }],
          tuesday: [{ start: "09:00", end: "17:00" }],
          wednesday: [{ start: "09:00", end: "17:00" }],
          thursday: [{ start: "09:00", end: "17:00" }],
          friday: [{ start: "09:00", end: "17:00" }],
          saturday: [],
          sunday: []
        },
        slotDuration: 30,
        location: "Medical Office",
        bufferTime: 0
      });
    }

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error("Error getting availability settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get availability settings"
    });
  }
};

// Update doctor's availability settings
export const updateAvailabilitySettings = async (req, res) => {
  try {
    const { schedule, slotDuration, location, bufferTime } = req.body;

    let availability = await DoctorAvailability.findOne({ doctor: req.user.id });

    if (!availability) {
      availability = await DoctorAvailability.create({
        doctor: req.user.id,
        schedule,
        slotDuration: slotDuration || 30,
        location: location || "",
        bufferTime: bufferTime || 0
      });
    } else {
      if (schedule) availability.schedule = schedule;
      if (slotDuration) availability.slotDuration = slotDuration;
      if (location !== undefined) availability.location = location;
      if (bufferTime !== undefined) availability.bufferTime = bufferTime;
      
      await availability.save();
    }

    res.json({
      success: true,
      message: "Availability settings updated successfully",
      availability
    });
  } catch (error) {
    console.error("Error updating availability settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability settings"
    });
  }
};

// Update specific day schedule
export const updateDaySchedule = async (req, res) => {
  try {
    const { day, slots } = req.body;

    if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day"
      });
    }

    let availability = await DoctorAvailability.findOne({ doctor: req.user.id });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability settings not found. Please create them first."
      });
    }

    availability.schedule[day] = slots;
    await availability.save();

    res.json({
      success: true,
      message: `${day.charAt(0).toUpperCase() + day.slice(1)} schedule updated successfully`,
      availability
    });
  } catch (error) {
    console.error("Error updating day schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update day schedule"
    });
  }
};