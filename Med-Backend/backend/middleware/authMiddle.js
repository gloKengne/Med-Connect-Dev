// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log("🔐 Auth Middleware - Checking authorization...");

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ No valid authorization header");
      return res.status(401).json({ 
        success: false,
        message: "No token provided, authorization denied" 
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log("❌ Token extraction failed");
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("🔓 Token decoded - User ID:", decoded.id);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      console.log("❌ User not found for ID:", decoded.id);
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("✅ User authenticated:", {
      id: user._id.toString(),
      email: user.email,
      userType: user.userType,
      name: `${user.firstName} ${user.lastName}`
    });

    // Add user to request object - CRITICAL: Convert ObjectId to string
    req.user = {
      id: user._id.toString(), // ⚠️ MUST be string for comparison
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired - please log in again" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Server error in authentication" 
    });
  }
};

export default authMiddleware;