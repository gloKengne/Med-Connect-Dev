import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
  try {
    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const doc = new Document({
      docTitle: req.body.docTitle,
      docDate: req.body.docDate,
      description: req.body.description,
      category: req.body.category,
      fileUrl,
      patientId: req.user.id
    });

    await doc.save();

    res.status(201).json({
      message: "Document uploaded successfully",
      document: doc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ patientId: req.user.id });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch documents" });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    // Check if document belongs to user
    if (doc.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch document" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    if (doc.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await doc.deleteOne();
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete document" });
  }
};

// export const getPatientDocumentsForDoctor = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     // Check if the patientId is a valid MongoDB ObjectId to prevent crashes
//     if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
//         return res.status(400).json({ success: false, error: "Invalid Patient ID" });
//     }

//     const docs = await Document.find({ patientId: patientId }).sort({ docDate: -1 });
    
//     // Always return a JSON object with success: true
//     res.json({ success: true, documents: docs });
//   } catch (err) {
//     console.error("Backend Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// };