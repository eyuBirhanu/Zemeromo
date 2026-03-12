"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Github, Star, ChevronRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../ui/Logo";

// --- DYNAMIC GITHUB STAR BADGE (TypeScript) ---
function GithubBadge({ repo, className = "" }: { repo: string; className?: string }) {
    // Explicitly typing the state as number | null
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch(`https://api.github.com/repos/${repo}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.stargazers_count !== undefined) {
                    setStars(data.stargazers_count);
                }
            })
            .catch((err) => console.error("Failed to fetch GitHub stars", err));
    }, [repo]);

    return (
        <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 ${className}`}
        >
            <Github size={16} className="group-hover:text-white transition-colors" />

            {/* "Star" text hides on very small mobile screens to save space, but icon remains */}
            <span className="hidden sm:inline group-hover:text-white transition-colors">Star</span>

            {stars !== null && (
                <>
                    <span className="w-px h-3 bg-white/20"></span>
                    <span className="flex items-center gap-1 text-white font-semibold">
                        <Star size={12} className="fill-gray-500 text-gray-500 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
                        {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(stars)}
                    </span>
                </>
            )}
        </a>
    );
}

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const GITHUB_REPO = "eyuBirhanu/Zemeromo";

    // Lock page scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isMenuOpen]);

    const mobileMenuLinks = [
        { name: "About", href: "/about" },
        { name: "Features", href: "#features" },
        { name: "Mobile App", href: "#download" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 h-16 md:h-20 transition-all duration-300">

            {/* Restored the transparent Glass Background */}
            <div className="absolute inset-0 bg-dark-bg/10 backdrop-blur-md border-b border-white/[0.03]"></div>

            <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" className="relative z-50" onClick={() => setIsMenuOpen(false)}>
                    <Logo />
                </Link>

                {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
                <div className="hidden md:flex items-center gap-8 relative z-50">
                    <div className="flex items-center gap-8 text-sm font-medium text-gray-300">
                        {mobileMenuLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="hover:text-accent transition-colors duration-300 tracking-wide">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-white/10"></div>

                    <div className="flex items-center gap-4">
                        <GithubBadge repo={GITHUB_REPO} />
                        <Link
                            href="/auth/login"
                            className="group flex items-center gap-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full border border-white/10 hover:border-accent/30 transition-all duration-300"
                        >
                            <span>Choir Login</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-accent group-hover:shadow-[0_0_8px_rgba(212,244,121,0.6)] transition-all duration-300"></span>
                        </Link>
                    </div>
                </div>

                {/* --- MOBILE TOGGLE & GITHUB BADGE --- */}
                <div className="flex items-center gap-3 md:hidden relative z-50">
                    {/* GitHub Badge sits cleanly in the header to drive action */}
                    <GithubBadge repo={GITHUB_REPO} />

                    <button
                        className="text-gray-300 hover:text-white p-1 transition-transform duration-300 active:scale-90"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* --- MOBILE FULL-SCREEN OVERLAY MENU --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 top-16 md:hidden bg-dark-bg/95 backdrop-blur-xl z-40 flex flex-col justify-between overflow-y-auto"
                    >
                        {/* Links Section */}
                        <div className="flex flex-col px-6 pt-8 pb-4 gap-2">
                            {mobileMenuLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between py-4 text-2xl font-serif text-gray-300 hover:text-accent border-b border-white/5 transition-colors"
                                    >
                                        {link.name}
                                        <ChevronRight size={20} className="opacity-40" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Actions Section (Bottom of mobile screen) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="flex flex-col px-6 pb-12 gap-4 mt-auto"
                        >
                            <Link
                                href="/auth/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-[#c2e658] text-dark-bg py-4 rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-[0_0_20px_-5px_rgba(212,244,121,0.3)]"
                            >
                                <ShieldCheck size={20} />
                                Choir Admin Login
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}