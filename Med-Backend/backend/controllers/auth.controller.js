import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, userType } = req.body;

    console.log('📝 Registration attempt:', { email, userType });

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: "Email already used" 
      });
    }

    // Create user - PASSWORD WILL BE HASHED BY THE MODEL'S PRE-SAVE HOOK
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Don't hash here - let the model do it
      phone,
      address,
      userType: userType || "patient"
    });

    console.log('✅ User created:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Prepare user response (exclude password)
    const userResponse = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      isVerified: user.isVerified
    };

    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration",
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    // Find user - INCLUDE password field for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log('👤 User found:', user._id);

    // Compare password using the model's method
    const isMatch = await user.matchPassword(password);
    
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userResponse = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      isVerified: user.isVerified
    };

    console.log('✅ Login successful for:', email);

    res.status(200).json({ 
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: error.message 
    });
  }
};