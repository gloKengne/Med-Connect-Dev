import express from "express";
import auth from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { uploadDocument, getMyDocuments } from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", auth, upload.single("file"), uploadDocument);
router.get("/my-documents", auth, getMyDocuments);

export default router;
