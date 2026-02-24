"use client";

import { AlertTriangle, Info, XCircle, X } from "lucide-react";

interface AlertBannerProps {
    type?: "warning" | "info" | "error";
    title: string;
    message: string;
    onClose: () => void;
}

export default function AlertBanner({ type = "info", title, message, onClose }: AlertBannerProps) {
    // Determine colors and icons based on the type
    const config = {
        warning: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            text: "text-amber-500",
            icon: <AlertTriangle size={20} />,
        },
        info: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            text: "text-blue-400",
            icon: <Info size={20} />,
        },
        error: {
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            text: "text-red-400",
            icon: <XCircle size={20} />,
        },
    };

    const current = config[type];

    return (
        <div className={`relative w-full ${current.bg} border-b ${current.border} px-4 py-3 flex items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 fade-in duration-300 z-40`}>

            <div className="flex items-start sm:items-center gap-3 flex-1">
                <div className={`mt-0.5 sm:mt-0 ${current.text}`}>
                    {current.icon}
                </div>
                <div>
                    <span className={`font-bold text-sm mr-2 ${current.text}`}>
                        {title}
                    </span>
                    <span className="text-gray-300 text-sm leading-relaxed">
                        {message}
                    </span>
                </div>
            </div>

            <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
                aria-label="Close banner"
            >
                <X size={18} />
            </button>
        </div>
    );
}