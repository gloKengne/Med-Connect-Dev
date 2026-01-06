import express from "express";
import { getMyDocuments } from "../controllers/documentController.js";
import authMiddle from "../middleware/authMiddle.js";

const router = express.Router();

// Route for getting documents
router.get("/my-documents", authMiddle, getMyDocuments);

// THIS IS THE MISSING LINE THAT FIXES YOUR ERROR
export default router;