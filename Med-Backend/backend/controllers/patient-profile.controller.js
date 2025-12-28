import User from "../models/User.js";

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient profile",
      error: error.message
    });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      emergencyContact,
      medicalHistory,
      currentMedications,
      phone,
      address
    } = req.body;

    const patient = await User.findById(req.user.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Update fields
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (bloodType) patient.bloodType = bloodType;
    if (allergies) patient.allergies = allergies;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (currentMedications) patient.currentMedications = currentMedications;
    if (phone) patient.phone = phone;
    if (address) patient.address = address;

    await patient.save();

    // Return updated patient without password
    const updatedPatient = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: "Profile updated successfully",
      patient: updatedPatient
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient profile",
      error: error.message
    });
  }
};

// Get patient by ID (for doctors to view)
export const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message
    });
  }
};