"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Edit3, Trash2, FileText, Music, Star } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import InlinePlayer from "../songs/InlinePlayer";
import LyricsModal from "../songs/LyricsModal";
import api from "@/lib/api";
import { toast } from "sonner";

interface SongRowProps {
    song: any;
    onDelete: (id: string) => void;
}

export default function SongRow({ song, onDelete }: SongRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    // Local State for Toggles (Optimistic UI)
    const [status, setStatus] = useState(song.status);
    const [isFeatured, setIsFeatured] = useState(song.isFeatured);

    // 1. Status Toggle Handler
    const handleStatusToggle = async () => {
        const newStatus = status === "active" ? "archived" : "active";
        setStatus(newStatus);
        try {
            await api.put(`/songs/${song._id}`, { status: newStatus });
            toast.success(`Song ${newStatus === 'active' ? 'Published' : 'Archived'}`);
        } catch {
            setStatus(status); // Revert
            toast.error("Failed to update status");
        }
    };

    // 2. Featured Toggle Handler (NEW)
    const handleFeaturedToggle = async () => {
        const newValue = !isFeatured;
        setIsFeatured(newValue);
        try {
            await api.put(`/songs/${song._id}`, { isFeatured: newValue });
            toast.success(newValue ? "Added to Featured" : "Removed from Featured");
        } catch {
            setIsFeatured(!newValue); // Revert
            toast.error("Failed to update featured status");
        }
    };

    return (
        <>
            <LyricsModal
                isOpen={showLyrics}
                onClose={() => setShowLyrics(false)}
                title={song.title}
                lyrics={song.lyrics}
            />

            <TableRow className={`cursor-pointer transition-colors ${isExpanded ? "bg-white/[0.04]" : ""}`}>

                {/* 1. Thumbnail & Title */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 border border-white/5">
                            {song.thumbnailUrl ? (
                                <img src={song.thumbnailUrl} className="w-full h-full object-cover rounded-lg" alt="Art" />
                            ) : (
                                <Music size={20} />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm flex items-center gap-2">
                                {song.title}
                                {song.isCover && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        COVER
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500">{song.artistId?.name || "Unknown Artist"}</p>
                        </div>
                    </div>
                </TableCell>

                {/* 2. Album & Genre */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-300">{song.albumId?.title || "Single"}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide bg-white/5 px-1.5 py-0.5 rounded w-fit mt-1">
                            {song.genre}
                        </span>
                    </div>
                </TableCell>

                {/* 3. Status Toggle */}
                <TableCell>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Toggle checked={status === "active"} onChange={handleStatusToggle} />
                        <span className={`text-[10px] uppercase font-bold ${status === "active" ? "text-accent" : "text-gray-600"}`}>
                            {status === "active" ? "Active" : "Hidden"}
                        </span>
                    </div>
                </TableCell>

                {/* 4. Featured Toggle (NEW) */}
                <TableCell>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFeaturedToggle();
                        }}
                        className={`p-2 rounded-full transition-all ${isFeatured
                                ? "text-yellow-400 bg-yellow-400/10"
                                : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                            }`}
                        title="Toggle Featured"
                    >
                        <Star size={18} fill={isFeatured ? "currentColor" : "none"} />
                    </button>
                </TableCell>

                {/* 5. Expand Chevron */}
                <TableCell>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-all ${isExpanded ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white"}`}
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </TableCell>
            </TableRow>

            {/* EXPANDED SECTION */}
            {isExpanded && (
                <tr className="bg-[#151922] border-b border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">

                            {/* Left Column: Player & Metadata */}
                            <div className="flex-1 w-full space-y-5">

                                {/* Audio Player */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Audio Preview</h4>
                                    {song.audioUrl ? (
                                        <InlinePlayer src={song.audioUrl} />
                                    ) : (
                                        <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 text-center">
                                            Audio File Missing
                                        </div>
                                    )}
                                </div>

                                {/* Credits Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Writer</span>
                                        <span className="text-sm text-gray-200 font-medium">{song.credits?.writer || "—"}</span>
                                    </div>
                                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Composer</span>
                                        <span className="text-sm text-gray-200 font-medium">{song.credits?.composer || "—"}</span>
                                    </div>
                                </div>

                                {song.isCover && (
                                    <div className="text-xs text-blue-400 flex items-center gap-2 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                        <Music size={12} />
                                        Original Version by: <span className="font-bold">{song.originalCredits}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Analytics & Actions */}
                            <div className="flex flex-col gap-4 min-w-[200px] border-l border-white/10 pl-8">

                                {/* Quick Stats */}
                                <div className="space-y-2 mb-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Plays</span>
                                        <span className="text-white font-mono">{song.stats?.plays || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Downloads</span>
                                        <span className="text-white font-mono">{song.stats?.downloads || 0}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => setShowLyrics(true)}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <FileText size={16} />
                                    View Lyrics
                                </button>

                                <Link
                                    href={`/dashboard/songs/edit/${song._id}`}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <Edit3 size={16} />
                                    Edit Details
                                </Link>

                                <button
                                    onClick={() => onDelete(song._id)}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Song
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}