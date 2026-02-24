"use client";

import { useState } from "react";
import { Eye, Trash2, ChevronDown, ChevronUp, Mic2, Disc, Music } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";

interface AdminRowProps {
    user: any;
    index: number; // Row Counter
    onToggleStatus: (id: string, status: boolean) => void;
    onDelete: (id: string) => void;
}

export default function AdminRow({ user, index, onToggleStatus, onDelete }: AdminRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Safe stats (default to 0 if missing)
    const stats = user.stats || { songs: 0, albums: 0, singers: 0 };

    return (
        <>
            {/* --- MAIN ROW --- */}
            <TableRow className={`cursor-pointer transition-colors ${isExpanded ? "bg-white/[0.04]" : ""}`}>

                {/* 1. Counter */}
                <TableCell className="text-gray-500 font-mono text-xs w-12">
                    {(index + 1).toString().padStart(2, '0')}
                </TableCell>

                {/* 2. Admin Name */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-accent font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-white group-hover:text-accent transition-colors">
                                {user.username}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user._id.slice(-4)}</p>
                        </div>
                    </div>
                </TableCell>

                {/* 3. Church */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {user.churchId?.name || "Unassigned"}
                    </span>
                </TableCell>

                {/* 4. Contact */}
                <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="text-xs space-y-1">
                        <p>{user.phoneNumber}</p>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </TableCell>

                {/* 5. Status Toggle */}
                <TableCell>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <Toggle
                            checked={user.isActive}
                            onChange={() => onToggleStatus(user._id, user.isActive)}
                        />
                        <span className={`text-xs ${user.isActive ? 'text-accent' : 'text-gray-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </TableCell>

                {/* 6. Actions */}
                <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Expand Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 rounded-lg transition-all ${isExpanded ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white"}`}
                        >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        <button
                            onClick={() => onDelete(user._id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </TableCell>
            </TableRow>

            {/* --- EXPANDED STATS ROW --- */}
            {isExpanded && (
                <tr className="bg-black/20 border-b border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-around bg-white/[0.02] border border-white/5 rounded-xl p-6 shadow-inner">

                            {/* Stat 1: Singers */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Mic2 size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.singers}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Singers</p>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-white/10"></div>

                            {/* Stat 2: Albums */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                    <Disc size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.albums}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Albums</p>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-white/10"></div>

                            {/* Stat 3: Songs */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-full bg-accent/10 text-accent border border-accent/20 group-hover:scale-110 transition-transform">
                                    <Music size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.songs}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Songs</p>
                                </div>
                            </div>

                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}