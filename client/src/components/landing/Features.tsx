import { WifiOff, Mic2, BookOpen, Layers } from "lucide-react";

const features = [
    {
        // Feature 1: The "Hero" feature
        // Note: Icon color is handled in the map function below based on "isPrimary"
        icon: <WifiOff size={28} />,
        title: "Offline Worship",
        desc: "No internet? No problem. Your entire lyric library and audio downloads stay with you in the sanctuary. Reliability when you need it most."
    },
    {
        icon: <BookOpen size={28} />,
        title: "Readable Lyrics",
        desc: "Professionally formatted Amharic & Oromo lyrics. Clean fonts designed specifically for projection and readability."
    },
    {
        icon: <Mic2 size={28} />,
        title: "Original Audio",
        desc: "Stream original studio recordings directly. Listen to the melody while you learn the lyrics."
    },
    {
        icon: <Layers size={28} />,
        title: "Choir Admin",
        desc: "A dedicated portal for leaders to upload songs, manage albums, and track ministry engagement."
    }
];

export default function Features() {
    return (
        <section id="features" className="relative py-24 bg-dark-bg overflow-hidden">

            {/* --- BACKGROUND INTEGRATION (The Lime Approach) --- */}

            {/* 1. Noise Texture (Matches Hero) */}
            <div className="absolute inset-0 bg-noise z-10 opacity-20 pointer-events-none"></div>

            {/* 2. Top Fade (Smooth transition) */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-dark-bg to-transparent z-20"></div>

            {/* 3. The LIME Light Source (Top Left - Dominant) */}
            <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            {/* 4. Supporting Emerald Shadow (Bottom Right - Subtle Depth) */}
            <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>


            {/* --- CONTENT --- */}
            <div className="relative z-20 max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-6">
                        Built for <span className="text-gradient">Ministry.</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-sans">
                        Modern tools designed to honor the age-old message of the Gospel.
                        Distraction-free and reliable.
                    </p>
                </div>

                {/* The Layout */}
                <div className="grid md:grid-cols-2 gap-6">

                    {features.map((f, i) => {
                        const isPrimary = i === 0;

                        return (
                            <div
                                key={i}
                                className={`
                                    relative p-8 rounded-3xl transition-all duration-300 group border
                                    ${isPrimary
                                        ? "bg-white/5 border-accent/30 shadow-[0_0_40px_-15px_rgba(212,244,121,0.2)]" // Lime Highlight
                                        : "bg-transparent border-white/5 hover:border-accent/20 hover:bg-white/[0.02]" // Subtle Lime Hover
                                    }
                                `}
                            >
                                {/* Icon Box */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105
                                    ${isPrimary
                                        ? "bg-accent text-dark-bg" // Solid Lime Box + Dark Icon
                                        : "bg-white/5 text-accent" // Glass Box + Lime Icon
                                    }
                                `}>
                                    {f.icon}
                                </div>

                                {/* Text Content */}
                                <h3 className={`text-xl font-bold mb-3 font-sans ${isPrimary ? "text-white" : "text-gray-200"}`}>
                                    {f.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed font-sans text-sm md:text-base">
                                    {f.desc}
                                </p>

                                {isPrimary && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent/20 rounded-full border border-accent/20">
                                        <span className="text-accent text-[10px] font-bold uppercase tracking-wider">Top Feature</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}