"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, User as UserIcon, Building2, Bell } from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { user, logout } = useAuth(); // Use Global Context
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Breadcrumb Logic
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean); // ['dashboard', 'songs', 'add']

    // Generate Breadcrumb Text (e.g., "Library > Add Song")
    const getBreadcrumb = () => {
        if (segments.length <= 1) return "Overview";

        return segments.slice(1).map((seg, index) => {
            // Capitalize first letter
            const text = seg.charAt(0).toUpperCase() + seg.slice(1);
            return (
                <span key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-600">/</span>}
                    <span className={index === segments.length - 2 ? "text-white" : "text-gray-500"}>
                        {text}
                    </span>
                </span>
            );
        });
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-20 bg-[#0f131a] border-b border-white/10 flex items-center justify-between px-6 md:px-8 z-30 sticky top-0">

            {/* Left: Mobile Menu & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg md:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Breadcrumbs */}
                <div className="hidden sm:flex items-center text-sm font-medium">
                    <span className="text-gray-600 mr-2">Dashboard</span>
                    <span className="text-gray-600 mr-2">/</span>
                    <div className="flex text-accent">{getBreadcrumb()}</div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Notification Icon (Placeholder) */}
                {/* <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Divider */}
                {/* <div className="h-8 w-px bg-white/10"></div> */}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-all"
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/70 to-accent/10 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
                            {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
                        </div>

                        {/* Name & Role (Desktop) */}
                        <div className="hidden md:flex flex-col items-start mr-1">
                            <span className="text-sm font-semibold text-white leading-tight">
                                {user?.username}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                {user?.role === "super_admin" ? "Platform Admin" : "Church Admin"}
                            </span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* The Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-[#1a1f2b] rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                            {/* Header Section */}
                            <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                                <p className="text-sm font-bold text-white mb-1">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 break-all">
                                    {/* Usually email or phone */}
                                    {user?.email || user?.phone}
                                </p>
                            </div>

                            {/* Info Section (Read Only) */}
                            <div className="p-2 space-y-1">
                                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400">
                                    <Building2 size={16} className="text-accent/70" />
                                    <span>
                                        {user?.role == "super_admin" ? "Headquarters" : user?.churchName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400">
                                    <UserIcon size={16} className="text-accent/70" />
                                    <span className="capitalize">{user?.role.replace("_", " ")}</span>
                                </div>
                            </div>

                            {/* Footer / Logout */}
                            <div className="p-2 border-t border-white/5 mt-1">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}