"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Music, Users, Disc, PlayCircle, HardDrive,
    ArrowUpRight, AlertTriangle, Loader2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/dashboard/stats");
                setData(res.data.data);
            } catch (error) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center text-accent">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (!data) return null;

    const { counts, storage, recentActivity, graph } = data;

    return (
        <div className="space-y-8 pb-10">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white">
                        Welcome, {" "}
                        {user?.username}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {user?.role === 'super_admin' ? 'System Overview' : 'Church Content Manager'}
                    </p>
                </div>

                {/* Storage Widget */}
                <div className="bg-[#1a1f2b] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4 min-w-[200px]">
                    <HardDrive size={20} className={storage.percentage > 80 ? "text-red-400" : "text-gray-400"} />
                    <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Storage</span>
                            <span className={storage.percentage > 80 ? "text-red-400 font-bold" : "text-gray-400"}>
                                {storage.usedGB} / {storage.limitGB} GB
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-1000 ${storage.percentage > 80 ? "bg-red-500" : "bg-accent"}`}
                                style={{ width: `${storage.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Songs"
                    value={counts.songs}
                    icon={Music}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <StatCard
                    label="Active Singers"
                    value={counts.artists}
                    icon={Users}
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                />
                <StatCard
                    label="Albums"
                    value={counts.albums}
                    icon={Disc}
                    color="text-pink-400"
                    bg="bg-pink-400/10"
                />
                <StatCard
                    label="Total Plays"
                    value={counts.plays.toLocaleString()}
                    icon={PlayCircle}
                    color="text-accent"
                    bg="bg-accent/10"
                    isMain
                />
            </div>

            {/* --- ANALYTICS & RECENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Upload Activity Graph */}
                <div className="lg:col-span-2 bg-[#1a1f2b] border border-white/5 p-6 rounded-2xl">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg">Upload Activity</h3>
                        <span className="text-xs text-gray-500 uppercase font-medium">Last 7 Days</span>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graph}>
                                <defs>
                                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4F479" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4F479" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f1219', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#D4F479' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#D4F479"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUploads)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Recently Added Songs */}
                <div className="bg-[#1a1f2b] border border-white/5 p-6 rounded-2xl flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg">Recently Added</h3>
                        <Link href="/dashboard/songs" className="text-xs text-accent hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {recentActivity.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-10">No recent songs found.</p>
                        )}

                        {recentActivity.map((song: any) => (
                            <div key={song._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                    <Music size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-accent transition-colors">
                                        {song.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {song.artistId?.name || "Unknown"}
                                        {user?.role === 'super_admin' && (
                                            <span className="text-gray-600"> • {song.churchId?.name}</span>
                                        )}
                                    </p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${song.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-gray-700/50 text-gray-400'
                                    }`}>
                                    {song.status === 'active' ? 'Live' : 'Draft'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Quick Upload Button */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <Link
                            href="/dashboard/songs/add"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-dashed border-white/20 hover:border-white/40"
                        >
                            <Music size={16} /> Upload New Song
                        </Link>
                    </div>
                </div>
            </div>

            {/* Storage Warning (Conditional) */}
            {storage.percentage > 90 && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-4 animate-pulse">
                    <AlertTriangle className="text-red-400 shrink-0" />
                    <div>
                        <h4 className="text-red-400 font-bold text-sm">Storage Critical</h4>
                        <p className="text-red-300/70 text-xs mt-1">
                            You are approaching your Cloudinary storage limit. Please contact the system administrator to upgrade the plan or clean up archived files.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, bg, isMain }: any) {
    return (
        <div className={`
            p-6 rounded-2xl border transition-all duration-300 group
            ${isMain
                ? "bg-accent text-dark-bg border-accent shadow-[0_0_30px_rgba(212,244,121,0.2)]"
                : "bg-[#1a1f2b] border-white/5 hover:border-white/10"
            }
        `}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-sm font-medium ${isMain ? "text-dark-bg/60" : "text-gray-400"}`}>
                        {label}
                    </p>
                    <h3 className={`text-3xl font-bold mt-2 font-mono ${isMain ? "text-dark-bg" : "text-white"}`}>
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${isMain ? "bg-black/10 text-dark-bg" : `${bg} ${color}`}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}