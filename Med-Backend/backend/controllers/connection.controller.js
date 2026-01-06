import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Patient requests connection to doctor
export const requestConnection = async (req, res) => {
  try {
    const { doctorId, recordIds = [] } = req.body;

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      patient: req.user.id,
      doctor: doctorId,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingConnection) {
      return res.status(400).json({ 
        success: false,
        message: "Connection already exists or is pending" 
      });
    }

    // Create connection
    const connection = await Connection.create({
      patient: req.user.id,
      doctor: doctorId,
      records: recordIds,
      status: "pending"
    });

    // Get patient info for notification
    const patient = await User.findById(req.user.id).select("firstName lastName");

    // Create notification for doctor
    await Notification.create({
      recipient: doctorId,
      sender: req.user.id,
      type: "CONNECTION_REQUEST",
      message: `${patient.firstName} ${patient.lastName} wants to connect with you`,
      relatedConnection: connection._id
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      connection
    });
  } catch (error) {
    console.error("Error requesting connection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send connection request" 
    });
  }
};

// Doctor responds to connection request
export const respondToConnection = async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    const connectionId = req.params.id;

    console.log('=== Connection Response Debug ===');
    console.log('Connection ID:', connectionId);
    console.log('Action:', action);
    console.log('User ID:', req.user.id);

    // Find connection
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
      console.log('Connection not found');
      return res.status(404).json({ 
        success: false,
        message: "Connection not found" 
      });
    }

    console.log('Connection found:', {
      doctor: connection.doctor.toString(),
      patient: connection.patient.toString(),
      status: connection.status
    });

    // Check if connection is already processed
    if (connection.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `Connection already ${connection.status}` 
      });
    }

    // Verify the logged-in doctor is the recipient
    if (connection.doctor.toString() !== req.user.id) {
      console.log('Authorization failed');
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized - You are not the recipient of this connection request" 
      });
    }

    // Update connection status
    connection.status = action === "accept" ? "accepted" : "rejected";
    await connection.save();

    console.log('Connection updated to:', connection.status);

    // Get doctor info for notification
    const doctor = await User.findById(req.user.id).select("firstName lastName");

    if (!doctor) {
      console.log('Doctor not found');
      return res.status(404).json({ 
        success: false,
        message: "Doctor profile not found" 
      });
    }

    // Notify patient
    await Notification.create({
      recipient: connection.patient,
      sender: req.user.id,
      type: action === "accept" ? "CONNECTION_ACCEPTED" : "CONNECTION_REJECTED",
      message: action === "accept" 
        ? `Dr. ${doctor.firstName} ${doctor.lastName} accepted your connection request`
        : `Dr. ${doctor.firstName} ${doctor.lastName} declined your connection request`,
      relatedConnection: connection._id
    });

    console.log('Notification sent to patient');

    res.json({
      success: true,
      message: `Connection ${action}ed successfully`,
      connection
    });
  } catch (error) {
    console.error("Error responding to connection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to respond to connection",
      error: error.message 
    });
  }
};

// Get doctor's connected patients
export const getDoctorConnections = async (req, res) => {
  try {
    console.log('📋 Fetching connections for doctor:', req.user.id);

    const connections = await Connection.find({
      doctor: req.user.id,
      status: "accepted"
    })
    .populate("patient", "firstName lastName email phone address dateOfBirth gender")
    .sort({ createdAt: -1 });

    console.log('✅ Found connections:', connections.length);
    
    if (connections.length > 0) {
      console.log('Sample connection:', {
        id: connections[0]._id,
        patient: connections[0].patient,
        status: connections[0].status
      });
    }

    res.json({
      success: true,
      connections
    });
  } catch (error) {
    console.error("❌ Error fetching doctor connections:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch connections",
      error: error.message 
    });
  }
};

// Get patient's connections - FIXED: Changed specialty field
export const getPatientConnections = async (req, res) => {
  try {
    console.log('📋 Fetching connections for patient:', req.user.id);
    
    const connections = await Connection.find({
      patient: req.user.id,
      status: "accepted"
    })
    .populate("doctor", "firstName lastName email phone address specialty") // Changed from specialization to specialty
    .sort({ createdAt: -1 });

    console.log('✅ Found patient connections:', connections.length);
    
    if (connections.length > 0) {
      console.log('Sample connection:', {
        id: connections[0]._id,
        doctor: connections[0].doctor,
        status: connections[0].status
      });
    }

    res.json({
      success: true,
      connections
    });
  } catch (error) {
    console.error("❌ Error fetching patient connections:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch connections",
      error: error.message 
    });
  }
};

// Check if patient is connected to a specific doctor
export const checkConnection = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const connection = await Connection.findOne({
      patient: req.user.id,
      doctor: doctorId,
      status: { $in: ["pending", "accepted"] }
    });

    res.json({
      success: true,
      isConnected: connection?.status === "accepted",
      isPending: connection?.status === "pending",
      connection
    });
  } catch (error) {
    console.error("Error checking connection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check connection" 
    });
  }
};

// Revoke connection (patient or doctor can revoke)
export const revokeConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: "Connection not found" 
      });
    }

    // Verify user is part of this connection
    const isPatient = connection.patient.toString() === req.user.id;
    const isDoctor = connection.doctor.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    connection.status = "revoked";
    await connection.save();

    res.json({
      success: true,
      message: "Connection revoked successfully"
    });
  } catch (error) {
    console.error("Error revoking connection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to revoke connection" 
    });
  }
};