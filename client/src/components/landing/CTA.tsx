import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

// --- CUSTOM ICONS (Official Shapes) ---

const GooglePlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.84L14.5,12.81L16.81,15.12M21.83,12L17.5,9.66L15.19,12L17.5,14.34L21.83,12M16.81,8.88L14.5,11.19L6.05,2.16L16.81,8.88Z" />
    </svg>
);

const AppleIcon = () => (
    <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 78.1 76.3 78.1 22.8 0 29.4-14.4 54.3-14.4 25.3 0 32.5 14.4 55 14.4 28.7 0 52-32.9 66-66.8 9.4-21.5 13.6-35 16.2-41.7-52.1-22-86.7-57.9-87.5-96.8zm-76.3-150.6c17-20.5 28.7-49.6 24.9-78.7-23.9 2.4-52.8 16.7-68.6 34.1-15 15-28.7 41.5-25.5 68.6 27.2 2.6 53-8.4 69.2-24z" />
    </svg>
);

export default function CTA() {
    return (
        <section id="download" className="relative py-24 bg-dark-bg px-4">

            {/* --- THE BIG CARD (Wider & Thinner) --- */}
            <div className="relative w-full max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] py-12 px-6 md:px-12 overflow-hidden text-center group">

                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-700"></div>
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">

                    {/* LEFT: Text Content */}
                    <div className="text-center md:text-left max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-4">
                            Ready to <span className="text-gradient">Worship?</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Join thousands of choir members in Ethiopia using Zemeromo.
                        </p>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex flex-col items-center md:items-end gap-6">

                        {/* Buttons Row */}
                        <div className="flex flex-col sm:flex-row gap-4">

                            {/* 1. Android Button (Lime) */}
                            <button className="flex items-center gap-3 bg-accent hover:bg-[#c2e658] text-dark-bg px-6 py-3.5 rounded-xl transition-all transform hover:scale-105 shadow-glow min-w-[180px]">
                                <GooglePlayIcon />
                                <div className="text-left leading-none">
                                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-1">Get it on</div>
                                    <div className="text-base font-bold font-sans">Google Play</div>
                                </div>
                            </button>

                            {/* 2. iOS Button (Glass) */}
                            <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3.5 rounded-xl transition-all hover:border-white/20 min-w-[180px]">
                                <AppleIcon />
                                <div className="text-left leading-none">
                                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Download on the</div>
                                    <div className="text-base font-bold font-sans">App Store</div>
                                </div>
                            </button>
                        </div>

                        {/* The "Admin" Link (No more "Portal") */}
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-accent transition-colors duration-300"
                        >
                            <ShieldCheck size={14} />
                            <span>Are you a Choir Leader? Access the Dashboard</span>
                            <ArrowRight size={14} />
                        </Link>

                    </div>

                </div>
            </div>
        </section>
    );
}