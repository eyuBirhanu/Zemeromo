import Link from "next/link";
import { Music2, ExternalLink, Instagram, Facebook, Send } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-bg border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* LEFT: Brand Identity & Slogan */}
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    {/* Logo (Grayscale to keep it quiet) */}
                    <div className="flex items-center gap-2 text-white/40 grayscale hover:grayscale-0 hover:text-accent transition-all duration-500">
                        <Music2 size={18} />
                        <span className="font-serif font-bold tracking-tight text-lg">Zemeromo</span>
                    </div>

                    {/* Divider (Hidden on mobile) */}
                    <span className="hidden md:inline text-gray-800 h-4 border-l border-white/10"></span>

                    {/* The "Kingdom" Slogan & Copyright */}
                    <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs text-gray-600">
                        <span>Built for the Kingdom.</span>
                        <span className="hidden md:inline text-gray-800">•</span>
                        <span>&copy; {currentYear}</span>
                    </div>
                </div>

                {/* RIGHT: Socials & Legal (Grouped) */}
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

                    {/* Social Icons (Small & Muted) */}
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-gray-600 hover:text-accent transition-colors duration-300">
                            <Send size={16} /> {/* Telegram (Very popular in Ethiopia) */}
                        </a>
                        <a href="#" className="text-gray-600 hover:text-accent transition-colors duration-300">
                            <Instagram size={16} />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-accent transition-colors duration-300">
                            <Facebook size={16} />
                        </a>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden md:block w-px h-4 bg-white/10"></div>

                    {/* Combined Privacy & Terms */}
                    <Link
                        href="/legal"
                        className="group flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
                    >
                        <span>Privacy & Terms</span>
                        <ExternalLink size={10} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                    </Link>
                </div>

            </div>
        </footer>
    );
}