import express from "express";
import { createAlbum, getAlbums, getAlbumById, updateAlbum, deleteAlbum } from "../controllers/albumController";
import { protect, authorize } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";
import { identifyUser } from "../middleware/identify";
import { enforceDraftMode } from "../middleware/statusGuard";

const router = express.Router();

router.get("/", identifyUser, getAlbums);
router.get("/:id", identifyUser, getAlbumById);

router.use(protect, authorize("church_admin", "super_admin"));

router.post("/", uploadImage.single("coverImage"), enforceDraftMode, createAlbum);
router.put("/:id", uploadImage.single("coverImage"), enforceDraftMode, updateAlbum);
router.delete("/:id", deleteAlbum);

export default router;