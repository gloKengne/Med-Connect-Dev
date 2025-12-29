import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document"
      }
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "revoked"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Connection", connectionSchema);
