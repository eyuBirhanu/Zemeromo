"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Trash2, Play, Download, Star } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface AlbumRowProps {
    album: any;
    onDelete: (id: string) => void;
    isSuperAdmin?: boolean;
}

export default function AlbumRow({ album, onDelete, isSuperAdmin }: AlbumRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Local state for toggles to provide instant UI feedback
    const [published, setPublished] = useState(album.isPublished);
    const [featured, setFeatured] = useState(album.isFeatured);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const confirmDelete = () => {
        onDelete(album._id);
        setIsConfirmModalOpen(false);
    };

    // Toggle Logic
    const handleToggle = async (field: "isPublished" | "isFeatured", value: boolean, setter: (val: boolean) => void) => {
        // Optimistic update
        setter(value);
        try {
            await api.put(`/albums/${album._id}`, { [field]: value });
            toast.success(`Album ${field === 'isPublished' ? 'Visibility' : 'Featured status'} updated`);
        } catch (error) {
            setter(!value); // Revert on error
            toast.error("Failed to update status");
        }
    };

    return (
        <>
            {/* --- MAIN ROW --- */}
            <TableRow className={`cursor-pointer transition-colors ${isExpanded ? "bg-white/[0.04]" : ""}`}>

                {/* 1. Cover Art & Title */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden border border-white/10 shadow-sm group-hover:shadow-glow transition-all">
                            {album.coverImageUrl ? (
                                <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">No Art</div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{album.title}</p>
                            <p className="text-xs text-gray-500">{album.artistId?.name || "Unknown Artist"}</p>
                        </div>
                    </div>
                </TableCell>
                {isSuperAdmin && (
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                                {album.churchId?.name || "Unknown"}
                            </span>
                            <span className="text-[10px] text-gray-500">
                                {album.churchId?.adminUserId?.username || "Unassigned"}
                            </span>
                        </div>
                    </TableCell>
                )}

                {/* 2. Affiliation & Genre (Created By) */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-300">
                            {album.churchId?.name || "Unknown Church"}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                            {album.genre} • {album.releaseYear || "N/A"}
                        </span>
                    </div>
                </TableCell>

                {/* 3. Status Toggles */}
                <TableCell>
                    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            <Toggle checked={published} onChange={() => handleToggle("isPublished", !published, setPublished)} />
                            <span className={`text-[10px] uppercase font-bold tracking-wide ${published ? "text-accent" : "text-gray-600"}`}>
                                {published ? "Live" : "Draft"}
                            </span>
                        </div>
                        {
                            isSuperAdmin && (
                                <div className="flex items-center gap-2">
                                    <Toggle checked={featured} onChange={() => handleToggle("isFeatured", !featured, setFeatured)} />
                                    <span className={`text-[10px] uppercase font-bold tracking-wide ${featured ? "text-yellow-400" : "text-gray-600"}`}>
                                        Featured
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </TableCell>

                {/* 4. Statistics */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1" title="Total Plays">
                            <Play size={12} className="text-accent" />
                            {album.stats?.totalPlays || 0}
                        </div>
                        <div className="flex items-center gap-1" title="Downloads">
                            <Download size={12} className="text-blue-400" />
                            {album.stats?.totalDownloads || 0}
                        </div>
                        <div className="flex items-center gap-1" title="Favorites">
                            <Star size={12} className="text-yellow-500" />
                            {album.stats?.favoritesCount || 0}
                        </div>
                    </div>
                </TableCell>

                {/* 5. Expand Button */}
                <TableCell>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-all ${isExpanded ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white"}`}
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </TableCell>
            </TableRow>

            {/* --- EXPANDED DETAILS --- */}
            {isExpanded && (
                <tr className="bg-[#151922] border-b border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="p-0">
                        <div className="p-6 flex flex-col md:flex-row gap-8">

                            {/* Left: Large Art */}
                            <div className="w-40 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                                {album.coverImageUrl ? (
                                    <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800" />
                                )}
                            </div>

                            {/* Center: Description & Tags */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">About Album</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed max-w-lg">
                                        {album.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Tags */}
                                {album.tags && album.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {album.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded bg-white/5 text-[10px] text-gray-400 border border-white/5">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Price Info */}
                                <div className="pt-2">
                                    <span className="text-xs text-gray-500">Price: </span>
                                    <span className="text-sm font-bold text-white">
                                        {album.price > 0 ? `${album.price} ETB` : "Free"}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col gap-3 justify-center border-l border-white/5 pl-8">
                                <Link
                                    href={`/dashboard/directory/edit-album/${album._id}`} // Assuming you setup this route
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <Edit3 size={16} />
                                    Edit Details
                                </Link>

                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Album
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title={`${album.title} - Delete Album`}
                description={`Are you sure you want to delete ${album.title}?`}
            />
        </>
    );
}