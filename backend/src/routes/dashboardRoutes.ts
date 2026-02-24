import express from "express";
import { protect, authorize } from "../middleware/auth";
import { getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats", protect, authorize("church_admin", "super_admin"), getDashboardStats);

export default router;