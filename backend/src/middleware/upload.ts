// backend/src/middleware/upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary"; // Make sure this path points to your cloudinary.ts config

// 1. Storage Configuration for Mixed Files (Audio + Images)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
        // Automatically route to raw/video/image depending on the file type
        return {
            folder: "zemeromo_uploads", // Folder name in Cloudinary
            resource_type: "auto",      // <-- 🚨 THIS IS THE MAGIC FIX 🚨
            allowed_formats: ["jpg", "jpeg", "png", "mp3", "wav", "m4a", "aac"],
        };
    },
});

// 2. Storage specifically for just Images (Churches, Artists, Albums)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
        return {
            folder: "zemeromo_images",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
        };
    },
});

// Export the middlewares
export const uploadAudio = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for songs
});

export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

// Note: If you have a default 'export default upload', you can keep it mapping to uploadImage for safety:
export default uploadImage;