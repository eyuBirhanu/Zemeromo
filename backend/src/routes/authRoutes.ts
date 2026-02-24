import express from "express";
import {
    registerUser, loginUser, createChurchAdmin,
    applyForChurchAdmin, registerNewChurchAndAdmin
} from "../controllers/authController";
import { protect, authorize } from "../middleware/auth";
import { uploadImage } from "../middleware/upload"; // Import your multer config

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/apply-admin", applyForChurchAdmin);

router.post("/register-church", uploadImage.single("logo"), registerNewChurchAndAdmin);


router.post("/register-church-admin", protect, authorize("super_admin"), createChurchAdmin);

export default router;