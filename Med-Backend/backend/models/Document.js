import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  docTitle: { type: String, required: true },
  docDate: { type: Date, required: true },
  description: String,
  category: { 
    type: String,
    enum: [
      "lab_results",
      "imaging",
      "prescription",
      "clinical_notes",
      "vaccination_records",
      "others"
    ],
    required: true
  },
  fileUrl: { type: String, required: true },  // link to uploaded file
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
