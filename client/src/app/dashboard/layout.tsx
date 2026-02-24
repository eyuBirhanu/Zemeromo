"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// Components
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import AlertBanner from "@/components/dashboard/layout/AlertBanner"; // <-- Import the new banner

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State to control if the banner is visible (so the user can close it)
    const [showPendingBanner, setShowPendingBanner] = useState(true);

    // 1. Security Check
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth/login");
            } else if (user.role !== "super_admin" && user.role !== "church_admin") {
                router.push("/");
            }
        }
    }, [user, isLoading, router]);

    // 2. Loading State
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-dark-bg text-accent">
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    // Check if the user is a pending church admin
    // (Assuming verificationStatus is attached to the user object from the backend)
    const isPendingAdmin = user.role === "church_admin" && user.verificationStatus === "pending";

    return (
        <div className="flex h-screen bg-[#0f131a] overflow-hidden">

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userRole={user.role}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Topbar */}
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                {/* 🚀 NOTIFICATION BANNER AREA 🚀 */}
                {isPendingAdmin && showPendingBanner && (
                    <AlertBanner
                        type="warning"
                        title="Account Pending Verification:"
                        message="You can set up your profile, upload albums, and add songs, but they will remain in 'Draft Mode' and hidden from the public app until a Super Admin verifies your church."
                        onClose={() => setShowPendingBanner(false)}
                    />
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none fixed"></div>

                    <div className="relative z-10 max-w-7xl mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}