import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    quote?: string;
    citation?: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    quote = "My heart, O God, is steadfast. I will sing and make music with all my soul.",
    citation = "Psalm 108:1"
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-dark-bg text-white overflow-hidden">
            {/* --- LEFT SIDE: Art & Inspiration --- */}
            <div className="hidden lg:flex relative flex-col justify-between p-12 bg-[#0a0d12] overflow-hidden">
                {/* Abstract Glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

                <div className="relative z-10">
                    <Link href="/"><Logo /></Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="w-12 h-1 bg-accent mb-8 rounded-full"></div>
                    <h1 className="text-4xl font-serif font-bold leading-tight mb-6 text-gray-100">"{quote}"</h1>
                    <p className="text-accent font-mono uppercase tracking-widest text-sm">— {citation}</p>
                </div>

                <div className="relative z-10 text-gray-600 text-xs">
                    © {new Date().getFullYear()} Zemeromo Platform.
                </div>
            </div>

            {/* --- RIGHT SIDE: Form Content --- */}
            <div className="relative flex flex-col justify-center items-center px-6 md:px-20 py-12 bg-dark-bg">
                {/* Mobile Glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] lg:hidden pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/"><Logo /></Link>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold font-serif mb-2">{title}</h2>
                        <p className="text-gray-400">{subtitle}</p>
                    </div>

                    {children}
                </div>

                {/* Mobile Footer */}
                <div className="absolute bottom-6 w-full text-center lg:hidden">
                    <p className="text-[10px] text-gray-600">Secure Admin Portal • Zemeromo</p>
                </div>
            </div>
        </div>
    );
}