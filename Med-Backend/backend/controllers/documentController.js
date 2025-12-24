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
