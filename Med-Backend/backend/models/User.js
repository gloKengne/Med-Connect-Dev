
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "doctor", "patient"], default: "patient" }
});

export default mongoose.model("User", userSchema);



