"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Trash2, Mic2, Users, Disc, Music } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ArtistRowProps {
    artist: any;
    onDelete: (id: string) => void;
    isSuperAdmin?: boolean;
}

export default function ArtistRow({ artist, onDelete, isSuperAdmin }: ArtistRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isActive, setIsActive] = useState(artist.isActive);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const confirmDelete = () => {
        onDelete(artist._id);
        setIsConfirmModalOpen(false);
    };

    const handleToggle = async () => {
        setIsActive(!isActive);
        try {
            await api.put(`/artists/${artist._id}`, { isActive: !isActive });
            toast.success("Status Updated");
        } catch {
            setIsActive(isActive);
            toast.error("Failed to update");
        }
    };

    return (
        <>
            <TableRow className={`cursor-pointer ${isExpanded ? "bg-white/[0.04]" : ""}`}>
                {/* 1. Avatar & Name */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 overflow-hidden border border-white/10">
                            {artist.imageUrl ? (
                                <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                    <Mic2 size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{artist.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                                {artist.isGroup ? "Choir / Team" : "Solo Artist"}
                            </p>
                        </div>
                    </div>
                </TableCell>
                {isSuperAdmin && (
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                                {artist.churchId?.name || "Unknown"}
                            </span>
                            <span className="text-[10px] text-gray-500">
                                {artist.churchId?.adminUserId?.username || "Unassigned"}
                            </span>
                        </div>
                    </TableCell>
                )}

                {/* 2. Church */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-300">
                            {artist.churchId?.name || "Independent"}
                        </span>
                        {/* Optional: Show location if available */}
                        {artist.churchId?.address?.city && (
                            <span className="text-[10px] text-gray-500">
                                {artist.churchId.address.city}
                            </span>
                        )}
                    </div>
                </TableCell>

                {/* 3. Stats Summary */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1"><Disc size={12} /> {artist.stats?.albumsCount || 0}</div>
                        <div className="flex items-center gap-1"><Music size={12} /> {artist.stats?.songsCount || 0}</div>
                    </div>
                </TableCell>

                {/* 4. Active Toggle */}
                <TableCell>
                    <div onClick={e => e.stopPropagation()}>
                        <Toggle checked={isActive} onChange={handleToggle} />
                    </div>
                </TableCell>

                {/* 5. Actions */}
                <TableCell>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-all ${isExpanded ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white"}`}
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </TableCell>
            </TableRow>

            {/* EXPANDED VIEW */}
            {isExpanded && (
                <tr className="bg-[#151922] border-b border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="p-0">
                        <div className="p-6 flex flex-col md:flex-row gap-8">
                            {/* Left: Bio */}
                            <div className="flex-1 space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">About</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {artist.description || "No biography available."}
                                </p>
                                {artist.isGroup && (
                                    <div className="flex items-center gap-2 text-sm text-accent mt-2">
                                        <Users size={14} />
                                        <span>{artist.membersCount || 0} Members</span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col gap-3 justify-center border-l border-white/5 pl-8">
                                <Link
                                    href={`/dashboard/directory/edit-artist/${artist._id}`}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <Edit3 size={16} /> Edit Profile
                                </Link>
                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} /> Delete Artist
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
                title={`${artist.name} - Delete Artist`}
                description={`Are you sure you want to delete ${artist.name}?`}
            />
        </>
    );
}