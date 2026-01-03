// routes/dashboardRoutes.js
import express from 'express';
import auth from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Connection from '../models/Connection.js'; // Assuming you have this model

const router = express.Router();

// Get patient dashboard stats
router.get('/patient/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Get connected doctors count
    const connectedDoctors = await Connection.countDocuments({
      patientId: req.user.id,
      status: 'accepted'
    });

    // Get total documents
    const totalDocuments = await Document.countDocuments({
      patientId: req.user.id
    });

    // Get upcoming appointments (you'll need to implement this based on your Appointment model)
    // const upcomingAppointments = await Appointment.countDocuments({
    //   patientId: req.user.id,
    //   appointmentDate: { $gte: new Date() },
    //   status: 'scheduled'
    // });

    res.json({
      success: true,
      stats: {
        connectedDoctors,
        totalDocuments,
        upcomingAppointments: 2, // Placeholder until you implement appointments
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get doctor dashboard stats
router.get('/doctor/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Get total connected patients
    const totalPatients = await Connection.countDocuments({
      doctorId: req.user.id,
      status: 'accepted'
    });

    // Get all connected patient IDs
    const connections = await Connection.find({
      doctorId: req.user.id,
      status: 'accepted'
    }).select('patientId');

    const patientIds = connections.map(conn => conn.patientId);

    // Get total documents from all connected patients
    const pendingReviews = await Document.countDocuments({
      patientId: { $in: patientIds }
    });

    // Get today's appointments (placeholder)
    // const todayAppointments = await Appointment.countDocuments({
    //   doctorId: req.user.id,
    //   appointmentDate: {
    //     $gte: new Date().setHours(0, 0, 0, 0),
    //     $lt: new Date().setHours(23, 59, 59, 999)
    //   }
    // });

    res.json({
      success: true,
      stats: {
        totalPatients,
        pendingReviews,
        todayAppointments: 12, // Placeholder
        activeConsultations: 4, // Placeholder
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

export default router;