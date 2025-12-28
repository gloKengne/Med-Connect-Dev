import User from "../models/User.js";

// Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialty,
      phone,
      hospital,
      yearsOfExperience,
      consultationFee,
      availability,
      bio
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user || user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update doctor profiles'
      });
    }

    // Update fields
    if (specialty) user.specialty = specialty;
    if (phone) user.phone = phone;
    if (hospital) user.hospital = hospital;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
    if (consultationFee !== undefined) user.consultationFee = consultationFee;
    if (availability) user.availability = new Map(Object.entries(availability));
    if (bio) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        specialty: user.specialty,
        hospital: user.hospital,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Complete onboarding (mark as verified)
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can complete onboarding'
      });
    }

    // Mark as verified after completing onboarding
    user.isVerified = true;
    user.availableToday = true;
    
    // Set default rating if not set
    if (!user.rating) user.rating = 5.0;
    if (!user.reviewCount) user.reviewCount = 0;

    await user.save();

    // Update localStorage with new user data
    const userResponse = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding'
    });
  }
};