import express from "express";
import { protect, authorize } from "../middleware/auth";
import { uploadAudio } from "../middleware/upload";
import { identifyUser } from "../middleware/identify";
import {
    createSong,
    getSongs,
    updateSong,
    deleteSong,
    getSongById
} from "../controllers/songController";

const router = express.Router();

// Public Routes (For App) - Use identifyUser to handle Guest vs User
router.get("/", identifyUser, getSongs);
router.get("/:id", identifyUser, getSongById);

// Protected Routes (For Dashboard)
router.use(protect, authorize("church_admin", "super_admin"));

router.post(
    "/",
    uploadAudio.fields([
        { name: "audio", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    createSong
);

router.put(
    "/:id",
    uploadAudio.fields([
        { name: "audio", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    updateSong
);

router.delete("/:id", deleteSong);

export default router;