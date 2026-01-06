// controllers/documentController.js

export const getMyDocuments = async (req, res) => {
  try {
    // If a patientId is provided in the URL query (by a doctor), use that.
    // Otherwise, use the ID of the logged-in user (the patient).
    const targetId = req.query.patientId || req.user.id;

    const docs = await Document.find({ patientId: targetId }).sort({ docDate: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Could not fetch documents" });
  }
};

