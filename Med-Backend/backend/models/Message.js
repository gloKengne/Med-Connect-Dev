import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
 {
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    hasAttachment: {
      type: Boolean,
      default: false
    },
    attachmentName: {
      type: String
    },
    attachmentUrl: {
      type: String
    }
  },
  { 
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { connection: 1, createdAt: -1 },
      { receiver: 1, isRead: 1 }
    ]
  }
);

export default mongoose.model("Message", messageSchema);
