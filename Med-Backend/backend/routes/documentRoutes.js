import express from "express";
import auth from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { uploadDocument, getMyDocuments, getDocumentById, 
  deleteDocument } from "../controllers/documentController.js";

const router = express.Router();


// Upload a new document
router.post("/upload", auth, upload.single("file"), uploadDocument);

// Get all documents for the logged-in user
router.get("/my-documents", auth, getMyDocuments);

// Get a specific document by ID
router.get("/:id", auth, getDocumentById);

// Update a document (metadata only, not file)
// TODO: Implement updateDocument controller function before uncommenting
// router.put("/:id", auth, updateDocument);

// Delete a document
router.delete("/:id", auth, deleteDocument);

export default router;