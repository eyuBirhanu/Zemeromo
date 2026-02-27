"use client"; // We need this because we are using State (useState)

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Import Icons
import Logo from "../ui/Logo";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        // Height wrapper: h-16 (64px) on mobile, h-20 (80px) on desktop
        <nav className="fixed top-0 left-0 w-full z-50 h-16 md:h-20 transition-all duration-300">

            {/* Glass Background */}
            <div className="absolute inset-0 bg-dark-bg/10 backdrop-blur-md border-b border-white/[0.03]"></div>

            <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Logo />
                </Link>

                {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link
                            href="/about"
                            className="hover:text-accent transition-colors duration-300 tracking-wide"
                        >
                            About
                        </Link>
                        <Link
                            href="#features"
                            className="hover:text-accent transition-colors duration-300 tracking-wide"
                        >
                            Features
                        </Link>
                        {/* Links to the CTA section */}
                        <Link
                            href="#download"
                            className="hover:text-accent transition-colors duration-300 tracking-wide"
                        >
                            Mobile App
                        </Link>
                    </div>

                    <div className="w-px h-5 bg-white/10"></div>

                    <Link
                        href="/auth/login"
                        className="group flex items-center gap-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/10 hover:border-accent/30 transition-all duration-300"
                    >
                        <span>Choir Login</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-accent group-hover:shadow-[0_0_8px_rgba(212,244,121,0.6)] transition-all duration-300"></span>
                    </Link>
                </div>

                {/* --- MOBILE TOGGLE (Visible on Mobile) --- */}
                <button
                    className="md:hidden text-gray-300 hover:text-white p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- MOBILE DROPDOWN MENU --- */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-dark-bg/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 md:hidden shadow-2xl animate-in slide-in-from-top-5 duration-200">
                    <Link
                        href="#features"
                        className="text-lg font-medium text-gray-300 hover:text-accent"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Features
                    </Link>
                    <Link
                        href="#download"
                        className="text-lg font-medium text-gray-300 hover:text-accent"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Mobile App
                    </Link>
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-bold"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Choir Login
                    </Link>
                </div>
            )}
        </nav>
    );
}