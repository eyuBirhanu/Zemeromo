import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// 1. UNIVERSAL STORAGE (Handles Both Audio & Images)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
        return {
            folder: "zemeromo_uploads",
            // 🚨 THIS IS THE FIX: 'auto' allows both MP3s and JPGs in the same request
            resource_type: "auto",
            allowed_formats: ["jpg", "jpeg", "png", "webp", "mp3", "wav", "m4a", "aac"],
        };
    },
});

// 2. Export the middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Export aliases if your routes use specific names
export const uploadAudio = upload;
export const uploadImage = upload;

export default upload;