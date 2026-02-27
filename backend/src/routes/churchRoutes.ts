import express from "express";
import { protect, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload"; // UPDATED
import { identifyUser } from "../middleware/identify";
import {
    createChurch,
    getChurches,
    verifyChurch,
    updateChurch,
    getChurchById,
    deleteChurch
} from "../controllers/churchController";

const router = express.Router();

router.get("/", identifyUser, getChurches);
router.get("/:id", getChurchById);

// 1. CREATE
router.post("/", protect, upload.single("logo"), createChurch); // UPDATED

// 2. UPDATE
router.put("/:id", protect, authorize("church_admin", "super_admin"), upload.single("logo"), updateChurch); // UPDATED

// 3. VERIFY
router.put("/:id/verify", protect, authorize("super_admin"), verifyChurch);

// 4. DELETE
router.delete("/:id", protect, authorize("super_admin"), deleteChurch);

export default router;