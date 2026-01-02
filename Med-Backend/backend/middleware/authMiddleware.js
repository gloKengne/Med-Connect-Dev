import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log("🔐 Auth check - Header:", authHeader);

    if (!authHeader) {
      console.log("❌ No authorization header");
      return res.status(401).json({ message: "No authorization header" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Invalid format");
      return res.status(401).json({ message: "Invalid authorization format. Use: Bearer <token>" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("✅ User authenticated:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    
    return res.status(401).json({ message: "Access denied", error: error.message });
  }
};





export default auth;