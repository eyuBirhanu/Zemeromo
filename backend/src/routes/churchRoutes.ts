import express from "express";
import { protect, authorize } from "../middleware/auth";
import { uploadImage } from "../middleware/upload"; // Assuming you exported uploadImage
import { identifyUser } from "../middleware/identify"; // Optional: to know if it's admin or guest
import {
    createChurch,
    getChurches,
    verifyChurch,
    updateChurch,
    getChurchById,
    deleteChurch
} from "../controllers/churchController";

const router = express.Router();

// Public / Semi-Public
router.get("/", identifyUser, getChurches);
router.get("/:id", getChurchById);

// 1. CREATE: Any logged-in user can apply to register a church.
router.post("/", protect, uploadImage.single("logo"), createChurch);

// 2. UPDATE: Church Admin or Super Admin. (FIXED: Added uploadImage.single)
router.put("/:id", protect, authorize("church_admin", "super_admin"), uploadImage.single("logo"), updateChurch);

// 3. VERIFY: Only Super Admin
router.put("/:id/verify", protect, authorize("super_admin"), verifyChurch);

// 4. DELETE: Only Super Admin
router.delete("/:id", protect, authorize("super_admin"), deleteChurch);

export default router;