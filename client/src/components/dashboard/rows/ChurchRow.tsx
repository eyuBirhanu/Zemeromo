"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Phone, Music, Disc, Mic2, Edit3, Trash2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ChurchRowProps {
    church: any;
    onToggleStatus: (id: string, currentStatus: string) => void;
    onDelete: (id: string) => void;
}

export default function ChurchRow({ church, onToggleStatus, onDelete }: ChurchRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- 1. SAFE DATA PARSING (Fixes the charAt crash) ---
    const churchName = church?.name || "Unknown Church";
    const churchInitial = churchName.charAt(0).toUpperCase();

    // Check if admin is an object and has a username
    const hasAdmin = church?.adminUserId && typeof church.adminUserId === "object";
    const adminName = hasAdmin ? church.adminUserId.username : "Unknown User";
    const adminInitial = hasAdmin && church.adminUserId.username
        ? church.adminUserId.username.charAt(0).toUpperCase()
        : "U";

    const isActive = church?.status === "verified";

    const confirmDelete = () => {
        onDelete(church._id);
        setShowDeleteModal(false);
    };

    // --- 2. ISOLATED TOGGLE HANDLER ---
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stops the row from expanding
        onToggleStatus(church._id, church.status);
    };

    return (
        <>
            {/* --- MAIN ROW --- */}
            <TableRow className={`cursor-pointer transition-colors ${isExpanded ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>

                {/* 1. Logo & Name */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden border border-white/10">
                            {church?.logoUrl ? (
                                <img src={church.logoUrl} alt={churchName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                    {churchInitial}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{churchName}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                <MapPin size={10} />
                                {church?.address?.city || "Unknown"}, {church?.address?.subCity || ""}
                            </div>
                        </div>
                    </div>
                </TableCell>

                {/* 2. Denomination */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <span className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {church?.denomination || "Unknown"}
                    </span>
                </TableCell>

                {/* 3. Admin */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    {hasAdmin ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
                                {adminInitial}
                            </div>
                            <span className="text-xs text-gray-300">
                                {adminName}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-600 italic">No Admin Assigned</span>
                    )}
                </TableCell>

                {/* 4. Status Toggle (FIXED) */}
                <TableCell>
                    {/* The div stops the click from triggering the row expansion */}
                    <div
                        className="flex items-center gap-3 inline-flex"
                        onClick={handleToggle}
                    >
                        <Toggle
                            checked={isActive}
                            onChange={() => { }} // We handle the click on the wrapper div instead
                        />
                        <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isActive ? "text-accent" : "text-gray-500"}`}>
                            {isActive ? "Verified" : "Pending"}
                        </span>
                    </div>
                </TableCell>

                {/* 5. Actions */}
                <TableCell>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 rounded-lg transition-all ${isExpanded ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white"}`}
                        >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </TableCell>
            </TableRow>

            {/* --- EXPANDED DETAILS PANEL --- */}
            {isExpanded && (
                <tr className="bg-[#151922] border-b border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <td colSpan={5} className="p-0">
                        <div className="p-6 grid md:grid-cols-3 gap-6">

                            {/* Column 1: Description & Contact */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">About</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {church?.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Phone size={14} className="text-accent" />
                                    {church?.contactPhone || "No Phone"}
                                </div>
                            </div>

                            {/* Column 2: Statistics */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-2">
                                        <Mic2 size={18} />
                                    </div>
                                    <p className="text-xl font-bold text-white">{church?.stats?.singers || 0}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Singers</p>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-2">
                                        <Disc size={18} />
                                    </div>
                                    <p className="text-xl font-bold text-white">{church?.stats?.albums || 0}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Albums</p>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-accent/10 text-accent rounded-full flex items-center justify-center mb-2">
                                        <Music size={18} />
                                    </div>
                                    <p className="text-xl font-bold text-white">{church?.stats?.songs || 0}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Songs</p>
                                </div>
                            </div>

                            {/* Column 3: Advanced Actions */}
                            <div className="flex flex-col justify-center gap-3 border-l border-white/5 pl-6">
                                <Link
                                    href={`/dashboard/directory/edit-church/${church?._id}`}
                                    className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    <Edit3 size={16} />
                                    Edit Details
                                </Link>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                    Delete Church
                                </button>
                            </div>

                        </div>
                    </td>
                </tr>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={`Delete ${churchName}?`}
                description="This will remove the church and unlink all associated data. This cannot be undone."
            />
        </>
    );
}