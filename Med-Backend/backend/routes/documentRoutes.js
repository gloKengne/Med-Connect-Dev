import express from "express";
import authMiddle from "../middleware/authMiddle.js";
import { upload } from "../middleware/upload.js";
import { uploadDocument, getMyDocuments, getDocumentById,
  deleteDocument } from "../controllers/documentController.js";


const router = express.Router();

// Upload a new document
router.post("/upload", authMiddle, upload.single("file"), uploadDocument);

// Get all documents for the logged-in user
router.get("/my-documents", authMiddle, getMyDocuments);

// Get a specific document by ID
router.get("/:id", authMiddle, getDocumentById);

// Delete a document
router.delete("/:id", authMiddle, deleteDocument);

export default router;