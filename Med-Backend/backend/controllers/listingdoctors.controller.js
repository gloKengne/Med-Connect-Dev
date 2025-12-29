import User from "../models/User.js";

// Get all doctors (for patient to browse)
export const getAllDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    
    // Remove isVerified requirement for testing
    let query = { userType: "doctor" };

    if (specialty && specialty !== "all") {
      query.specialty = new RegExp(specialty, "i");
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") }
      ];
    }

    const doctors = await User.find(query)
      .select("firstName lastName email phone address specialty hospital rating reviewCount availableToday isVerified")
      .sort({ rating: -1 });

    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch doctors" 
    });
  }
};

// Get single doctor details
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      userType: "doctor"
    }).select("-password");

    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch doctor details" 
    });
  }
};