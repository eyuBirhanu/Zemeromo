"use client";

import { useState, useRef, DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";

interface ImageUploadProps {
    label: string;
    onChange: (file: File | null) => void;
    previewUrl?: string;
    error?: string;
}

export default function ImageUpload({ label, onChange, previewUrl, error }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File | undefined) => {
        if (file && file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
            onChange(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const clearImage = () => {
        setPreview(null);
        onChange(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>

            <div
                className={`
                    relative w-full h-48 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group
                    ${isDragging ? "border-accent bg-accent/10 scale-[1.02]" : error ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/[0.02] hover:border-accent/30 hover:bg-white/[0.05]"}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium text-sm">Click or Drop to Change</p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearImage(); }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <div className="text-center p-6 pointer-events-none">
                        <div className={`w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? "text-accent bg-accent/20" : "text-gray-400 group-hover:text-accent"}`}>
                            <UploadCloud size={24} />
                        </div>
                        <p className="text-sm text-gray-300 font-medium">Click or Drag image here</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
            {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
        </div>
    );
}