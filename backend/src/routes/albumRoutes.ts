import express from "express";
import { createAlbum, getAlbums, getAlbumById, updateAlbum, deleteAlbum } from "../controllers/albumController";
import { protect, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload"; // UPDATED
import { identifyUser } from "../middleware/identify";
import { enforceDraftMode } from "../middleware/statusGuard";

const router = express.Router();

router.get("/", identifyUser, getAlbums);
router.get("/:id", identifyUser, getAlbumById);

router.use(protect, authorize("church_admin", "super_admin"));

router.post("/", upload.single("coverImage"), enforceDraftMode, createAlbum); // UPDATED
router.put("/:id", upload.single("coverImage"), enforceDraftMode, updateAlbum); // UPDATED
router.delete("/:id", deleteAlbum);

export default router;