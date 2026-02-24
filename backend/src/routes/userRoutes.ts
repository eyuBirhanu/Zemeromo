import express from "express";
import { getChurchAdmins, toggleUserStatus, deleteUser, getAdminStats } from "../controllers/userController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.use(protect); // All routes require login

// Only Super Admin can manage other admins
router.get("/admins", authorize("super_admin"), getChurchAdmins);
router.patch("/:id/status", authorize("super_admin"), toggleUserStatus);
router.delete("/:id", authorize("super_admin"), deleteUser);
router.get("/:id/stats", authorize("super_admin"), getAdminStats);

export default router;