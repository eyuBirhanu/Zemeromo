"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Users, MapPin, X, Disc, Building2, Terminal } from "lucide-react";
import Logo from "../../ui/Logo";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: "super_admin" | "church_admin" | "user"; // To conditionally show links
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
    const pathname = usePathname();

    // 1. Define Menu Items based on Role
    const menuItems = [
        {
            name: "Overview",
            icon: Home,
            href: "/dashboard",
            allowed: ["super_admin", "church_admin"]
        },
        {
            name: "Library",
            icon: Music,
            href: "/dashboard/songs",
            allowed: ["super_admin", "church_admin"]
        },
        // Only Super Admin sees Directory (Churches) & Users
        {
            name: "Directory",
            icon: Building2,
            href: "/dashboard/directory",
            allowed: ["super_admin", "church_admin"]
        },
        {
            name: "Admins",
            icon: Users,
            href: "/dashboard/users",
            allowed: ["super_admin"]
        },
        {
            name: "Tools",
            icon: Terminal,
            href: "/dashboard/tools",
            allowed: ["super_admin"]
        }

    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full w-72 bg-[#0f131a] border-r border-white/10
                    transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* 1. Header (Logo) */}
                <div className="flex items-center justify-between p-6 h-20 border-b border-white/5">
                    <Link href="/dashboard" onClick={onClose}>
                        <Logo />
                    </Link>
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
                    {menuItems.map((item) => {
                        // Hide if role doesn't match
                        if (userRole && !item.allowed.includes(userRole)) return null;

                        // Check Active State (Highlight if path starts with href)
                        // Exception: Dashboard Home ('/dashboard') needs exact match or it highlights everywhere
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => onClose()} // Close on mobile click
                                className={`
                                    relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? "bg-accent text-dark-bg font-bold shadow-[0_0_15px_-3px_rgba(212,244,121,0.4)]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }
                                `}
                            >
                                <item.icon
                                    size={20}
                                    className={isActive ? "text-dark-bg" : "text-gray-500 group-hover:text-accent transition-colors"}
                                />
                                <span>{item.name}</span>

                                {/* Active Indicator (Right side) */}
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 bg-dark-bg rounded-full opacity-50"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* 3. Footer (Version) */}
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary animate-spin-slow">
                            <Disc size={16} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-300 font-medium">Zema System</p>
                            <p className="text-[10px] text-gray-500">v1.0 Stable</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}