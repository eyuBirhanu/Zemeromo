import express from "express";
import { searchContent } from "../controllers/searchController";
import { identifyUser } from "../middleware/identify"; // Optional: if you want to track WHO searched

const router = express.Router();

router.get("/", identifyUser, searchContent);

export default router;