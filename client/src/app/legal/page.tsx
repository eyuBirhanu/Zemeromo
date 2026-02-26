import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LegalPage() {
    return (
        <main className="min-h-screen bg-dark-bg text-white relative">
            <Navbar />

            {/* --- BACKGROUND ART (From Hero) --- */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-noise z-10 opacity-20"></div>
                <div className="absolute inset-0 bg-black/30 z-0"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[130px] mix-blend-screen" />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-20 pt-40 pb-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">
                        Legal & Privacy
                    </h1>
                    <p className="text-gray-400">Last updated: February 2026</p>
                </div>

                <div className="bg-[#1a1f2b]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl space-y-12 animate-in fade-in duration-1000">

                    {/* PRIVACY SECTION */}
                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold text-accent font-serif border-b border-white/10 pb-4">Privacy Policy</h2>
                        <h3 className="text-xl font-bold text-white pt-4">1. Data Collection</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Zemeromo collects basic user information such as email addresses, phone numbers, and church affiliations solely for the purpose of account verification and role-based access control (RBAC).
                        </p>
                        <h3 className="text-xl font-bold text-white pt-2">2. Data Security</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            All passwords are cryptographically hashed before being stored in our database. We do not sell, rent, or trade your personal information to any third parties.
                        </p>
                    </section>

                    {/* TERMS SECTION */}
                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold text-accent font-serif border-b border-white/10 pb-4">Terms of Service</h2>
                        <h3 className="text-xl font-bold text-white pt-4">1. Content Ownership</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Churches and Choirs retain full copyright ownership of all audio files, lyrics, and metadata uploaded to the Zemeromo platform. By uploading content, you grant Zemeromo a non-exclusive license to distribute this content to end-users via our mobile application.
                        </p>
                        <h3 className="text-xl font-bold text-white pt-2">2. Acceptable Use</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            The platform is designed exclusively for Protestant Gospel music (Mezmur). Administrators are strictly prohibited from uploading secular music, copyrighted material they do not own, or harmful content. Zemeromo reserves the right to suspend accounts that violate these guidelines.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}