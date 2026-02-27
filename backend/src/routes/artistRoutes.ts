import express from "express";
import {
    createArtist,
    getArtists,
    getArtistById,
    updateArtist,
    deleteArtist
} from "../controllers/artistController";
import { protect, authorize } from "../middleware/auth";
import { identifyUser } from "../middleware/identify";
import { upload } from "../middleware/upload"; // UPDATED

const router = express.Router();

router.get("/", identifyUser, getArtists);
router.get("/:id", identifyUser, getArtistById);

// Protected Routes
router.post("/", protect, authorize("church_admin", "super_admin"), upload.single("image"), createArtist); // UPDATED
router.put("/:id", protect, authorize("church_admin", "super_admin"), upload.single("image"), updateArtist); // UPDATED
router.delete("/:id", protect, authorize("church_admin", "super_admin"), deleteArtist);

export default router;