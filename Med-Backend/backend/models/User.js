
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  userType: { type: String, enum: ["admin", "doctor", "patient"], default: "patient" },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);



