import express from "express";
import {
    createArtist,
    getArtists,
    getArtistById,
    updateArtist,
    deleteArtist
} from "../controllers/artistController";
import { protect, authorize } from "../middleware/auth";
import { identifyUser } from "../middleware/identify"; // <--- Import this!
import { uploadImage } from "../middleware/upload";

const router = express.Router();

// Public / Semi-Public Routes
// FIX: Add 'identify' so the backend knows if an Admin is requesting the list
router.get("/", identifyUser, getArtists);
router.get("/:id", identifyUser, getArtistById);

// Protected Routes
router.post("/", protect, authorize("church_admin", "super_admin"), uploadImage.single("image"), createArtist);
router.put("/:id", protect, authorize("church_admin", "super_admin"), uploadImage.single("image"), updateArtist);
router.delete("/:id", protect, authorize("church_admin", "super_admin"), deleteArtist);

export default router;