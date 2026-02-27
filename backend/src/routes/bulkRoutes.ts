import express from "express";
import { importJSON, uploadBulkMedia } from "../controllers/bulkController";
import { protect, authorize } from "../middleware/auth";
import { uploadAudio } from "../middleware/upload"; // Use the one that accepts 'auto' resource type

const router = express.Router();

router.use(protect, authorize("super_admin"));

router.post("/import", importJSON);

router.post("/media", uploadAudio.array("files", 20), uploadBulkMedia);

export default router;