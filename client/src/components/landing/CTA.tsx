import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

// --- CUSTOM ICONS (Official Shapes) ---

const GooglePlayIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 512 512"><g><path d="M99.617 8.057a50.191 50.191 0 0 0-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711 60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0 0 27.31-8.07l266.965-149.372-74.849-74.847z" fill="currentColor"></path></g></svg>
);

const AppleIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32"><g><path d="M11.7 32c-2.6 0-4.4-2.3-5.7-4.3-3.3-5.1-4-11.5-1.6-15.2 1.6-2.5 4.2-4 6.7-4 1.3 0 2.4.4 3.3.7.7.3 1.4.5 2.1.5.6 0 1.1-.2 1.8-.5.9-.3 2-.7 3.5-.7 2.2 0 4.5 1.2 6.1 3.2.2.2.3.5.2.8s-.2.5-.5.7c-1.8 1-2.8 2.8-2.6 4.8.1 2.1 1.4 3.8 3.3 4.5.3.1.5.3.6.6s.1.5 0 .8c-.7 1.5-1 2.2-1.9 3.5-1.5 2.2-3.3 4.5-5.7 4.5-1.1 0-1.8-.3-2.4-.6s-1.2-.6-2.4-.6c-1.1 0-1.7.3-2.4.6-.6.4-1.3.7-2.4.7z" fill="currentColor" ></path><path d="M15.7 8.7h-.2c-.5 0-.9-.4-1-.8-.3-1.7.3-3.7 1.6-5.3 1.2-1.5 3.2-2.5 5-2.7.5 0 1 .3 1.1.9.3 1.8-.3 3.7-1.6 5.3-1.1 1.6-3.1 2.6-4.9 2.6z" fill="currentColor"></path></g></svg>
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
                            <button className="flex items-center gap-3 bg-accent hover:bg-[#c2e658] text-dark-bg px-6 py-3.5 rounded-xl shadow-glow min-w-[180px]">
                                <GooglePlayIcon />
                                <div className="text-left leading-none text-nowrap">
                                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-1">Get it on</div>
                                    <div className="text-base font-bold font-sans">Google Play</div>
                                </div>
                            </button>

                            {/* 2. iOS Button (Glass) */}
                            <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3.5 rounded-xl transition-all hover:border-white/20 min-w-[180px]">
                                <AppleIcon />
                                <div className="text-left leading-none text-nowrap">
                                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 text-nowrap">Download on the</div>
                                    <div className="text-base font-bold font-sans text-nowrap">App Store</div>
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