import Link from "next/link";
import { Home, Music } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-dark-bg text-center px-6 overflow-hidden">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex flex-col items-center max-w-lg">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Music size={32} className="text-gray-400" />
                </div>

                <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 font-serif leading-none">
                    404
                </h1>

                <h2 className="text-2xl font-bold mt-6 mb-3 text-white">Page Not Found</h2>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    The hymn you are looking for hasn't been written yet, or the page has been moved to a new sanctuary.
                </p>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-dark-bg font-bold px-8 py-3.5 rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95"
                >
                    <Home size={18} />
                    Return Home
                </Link>
            </div>
        </div>
    );
}