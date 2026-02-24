"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    // Ensure we only run this on the client (Next.js SSR fix)
    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Don't render on server
    // 2. Don't render if closed
    if (!mounted || !isOpen) return null;

    // 3. TELEPORT to document.body (This fixes the table error)
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content Wrapper */}
            <div className="relative w-full max-w-lg bg-[#1a1f2b] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1f2b] rounded-t-2xl z-10">
                    <h3 className="text-xl font-bold text-white font-serif">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {children}
                </div>
            </div>
        </div>,
        document.body // <--- The Portal Target
    );
}