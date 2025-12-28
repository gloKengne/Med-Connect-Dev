
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true , select: false},
  phone: { type: String, required: true },
  address: { type: String, required: true },
  userType: { type: String, enum: ["admin", "doctor", "patient"], default: "patient" },
  isVerified: { type: Boolean, default: false },

 
  // Common fields
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },

  // Patient-specific fields
  bloodType: { type: String },
  allergies: [{ 
    name: String,
    severity: { type: String, enum: ["mild", "moderate", "severe"] },
    reaction: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],

  // Doctor-specific fields
  specialty: { type: String, trim: true },
  hospital: { type: String, trim: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  availableToday: { type: Boolean, default: true },
  licenseNumber: { type: String, trim: true },
  yearsOfExperience: { type: Number, default: 0 },
  availability: { type: Map, of: String, default: new Map() },
  bio: { type: String, trim: true },
  consultationFee: { type: Number, default: 0 }
   
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export default mongoose.model("User", userSchema);



