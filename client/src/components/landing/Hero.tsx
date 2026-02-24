import Link from "next/link";
import { ArrowRight, Smartphone, ShieldCheck } from "lucide-react";

export default function Hero() {
    return (
        // Change 1: 'h-screen' ensures it covers the full viewport height perfectly
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-bg pt-16">

            {/* --- BACKGROUND ART --- */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-noise z-10 opacity-20"></div>

                {/* Change 2: Dark Overlay to make it "more darken" */}
                <div className="absolute inset-0 bg-black/30 z-0"></div>

                {/* Orb 1: Reduced opacity to /10 for a subtle look */}
                <div className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]" />

                {/* Orb 2: Reduced opacity to /5 */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[130px] mix-blend-screen" />

                {/* Orb 3: Very faint center glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-30" />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">

                {/* 1. The Bible Verse Badge */}
                {/* Change 3: Slower animation (style overrides the CSS class duration) */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-[float_12s_ease-in-out_infinite]"
                >
                    <span className="text-accent text-xs tracking-widest uppercase font-bold">Psalm 33:3</span>
                    <span className="w-px h-3 bg-white/20"></span>
                    <span className="text-gray-300 text-sm font-serif italic">
                        "Sing to Him a new song..."
                    </span>
                </div>

                {/* 2. Main Headline */}
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-white leading-[1.1]">
                    Sing to the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-primary">
                        Mighty God.
                    </span>
                </h1>

                {/* 3. Subtitle */}
                {/* Change 4: Minimized text */}
                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto font-light leading-relaxed">
                    The digital sanctuary for Ethiopian Choirs. Verified lyrics, original audio, and offline worship.
                </p>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    {/* Primary CTA */}
                    <button className="group relative px-8 py-4 bg-accent hover:bg-[#c2e658] text-dark-bg rounded-full font-bold text-lg transition-all transform shadow-[0_0_30px_-10px_rgba(212,244,121,0.2)]">
                        <span className="flex items-center gap-2">
                            <Smartphone size={24} />
                            Get Zema App
                        </span>
                    </button>

                    {/* Secondary CTA */}
                    {/* Change 5: Renamed to "Choir Admin" */}
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all group"
                    >
                        <ShieldCheck className="text-accent group-hover:text-white transition-colors" size={20} />
                        Choir Admin
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}