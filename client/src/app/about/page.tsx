import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-dark-bg text-white relative">
            <Navbar />

            {/* --- BACKGROUND ART (From Hero) --- */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-noise z-10 opacity-20"></div>
                <div className="absolute inset-0 bg-black/30 z-0"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[130px] mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-30" />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-20 pt-40 pb-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-accent text-xs tracking-widest uppercase font-bold px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 inline-block">Our Mission</span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
                        Preserving the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-primary">
                            Sound of Worship.
                        </span>
                    </h1>
                </div>

                <div className="space-y-12 text-gray-300 text-lg leading-relaxed font-light bg-[#1a1f2b]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl animate-in fade-in duration-1000 delay-300">
                    <p>
                        Zemeromo was born out of a deep desire to digitize and preserve the rich heritage of Ethiopian Protestant Mezmur. For decades, local church choirs have produced songs that heal, encourage, and bring congregations closer to God.
                    </p>
                    <p>
                        However, accessing these songs offline, reading accurate lyrics, and organizing church audio archives has always been a challenge. We built Zemeromo to solve this.
                    </p>
                    <div className="border-l-4 border-accent pl-6 py-2 my-8">
                        <p className="text-xl font-serif italic text-white">
                            "Let the word of Christ dwell in you richly... singing psalms and hymns and spiritual songs, with thankfulness in your hearts to God." — Colossians 3:16
                        </p>
                    </div>
                    <p>
                        Our platform empowers Church Admins to upload their choir's original albums and lyrics directly to the cloud. Through the Zemeromo App, believers can download these songs once and worship anywhere, entirely offline.
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}