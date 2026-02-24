"use client";
import { X, Mic2 } from "lucide-react";

interface LyricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    lyrics: string;
}

export default function LyricsModal({ isOpen, onClose, title, lyrics }: LyricsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1a1f2b] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2">
                        <Mic2 size={18} className="text-accent" />
                        <h3 className="font-bold text-white text-lg">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-[#151922]">
                    <div className="text-center space-y-4">
                        {lyrics.split("\n").map((line, i) => (
                            <p key={i} className={`text-gray-300 leading-relaxed ${line.trim() === "" ? "h-4" : ""}`}>
                                {line}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 text-center">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-white transition-colors">
                        Close Lyrics
                    </button>
                </div>
            </div>
        </div>
    );
}