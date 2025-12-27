import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        "CONNECTION_REQUEST",
        "CONNECTION_ACCEPTED",
        "CONNECTION_REJECTED"
      ],
      required: true
    },
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    relatedConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
