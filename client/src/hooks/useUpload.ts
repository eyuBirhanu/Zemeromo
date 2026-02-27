import { useState } from "react";
import api from "@/lib/api";

export const useUpload = () => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const uploadFiles = async (endpoint: string, files: File[]) => {
        setIsUploading(true);
        setProgress(0);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file); // Must match backend .array("files")
        });

        try {
            const res = await api.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || 1;
                    const current = progressEvent.loaded;
                    const percent = Math.floor((current / total) * 100);
                    setProgress(percent);
                },
            });
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUploading(false);
            setProgress(0); // Reset after done
        }
    };

    return { progress, isUploading, uploadFiles };
};