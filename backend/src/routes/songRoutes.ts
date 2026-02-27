import express from "express";
import { protect, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload"; // Import the generic upload
import { identifyUser } from "../middleware/identify"; // or identifyUser depending on your file name
import {
    createSong,
    getSongs,
    updateSong,
    deleteSong,
    getSongById
} from "../controllers/songController";

const router = express.Router();

// Public Routes
router.get("/", identifyUser, getSongs);
router.get("/:id", identifyUser, getSongById);

// Protected Routes
router.use(protect, authorize("church_admin", "super_admin"));

// Create Song (Audio + Thumbnail)
router.post(
    "/",
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    createSong
);

// Update Song (Audio + Thumbnail)
router.put(
    "/:id",
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    updateSong
);

router.delete("/:id", deleteSong);

export default router;