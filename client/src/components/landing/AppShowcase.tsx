"use client";

import React, { useState, useEffect } from "react";
import {
    Home, PlayCircle, Folder, ChevronDown,
    MoreHorizontal, Heart, Repeat, Shuffle, SkipBack, SkipForward,
    Search, User, Maximize2
} from "lucide-react";

// --- DATA: The 3 Features to highlight ---
const FEATURES = [
    {
        id: 0,
        title: "Discover Worship",
        desc: "Personalized greetings and curated albums based on the time of day.",
        icon: <Home size={20} />,
        screen: "Home"
    },
    {
        id: 1,
        title: "Immersive Player",
        desc: "Read lyrics in Amharic & Oromo while streaming original studio audio.",
        icon: <PlayCircle size={20} />,
        screen: "Player"
    },
    {
        id: 2,
        title: "Offline Library",
        desc: "Download songs once. Worship anywhere, even without an internet connection.",
        icon: <Folder size={20} />,
        screen: "Library"
    }
];

export default function AppShowcase() {
    const [activeStep, setActiveStep] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % FEATURES.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-32 bg-[#0A0C02] overflow-hidden">
            {/* Background Noise & Glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D4F479]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: The Feature List */}
                    <div>
                        <h2 className="text-4xl font-bold font-serif text-white mb-6 tracking-tight">
                            Your Spiritual <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#D4F479]">
                                Companion.
                            </span>
                        </h2>
                        <p className="text-[#9CA3AF] mb-12 text-lg">
                            Designed for the worshipper. Simple, beautiful, and fully functional.
                        </p>

                        <div className="space-y-8">
                            {FEATURES.map((feature, index) => {
                                const isActive = activeStep === index;
                                return (
                                    <div
                                        key={feature.id}
                                        onClick={() => setActiveStep(index)}
                                        className="relative pl-8 cursor-pointer group"
                                    >
                                        {/* The Vertical Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-colors duration-500 ${isActive ? "bg-[#D4F479]" : "bg-white/10"}`}></div>

                                        {/* Content */}
                                        <div className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}>
                                            <h3 className={`text-xl font-bold mb-2 flex items-center gap-3 ${isActive ? "text-white" : "text-[#9CA3AF]"}`}>
                                                <span className={`p-2 rounded-lg ${isActive ? "bg-[#D4F479] text-black" : "bg-[#1a1f2b] text-[#9CA3AF]"}`}>
                                                    {feature.icon}
                                                </span>
                                                {feature.title}
                                            </h3>
                                            <p className="text-[#9CA3AF] leading-relaxed max-w-sm">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: The Phone Mockup */}
                    <div className="flex justify-center lg:justify-end">
                        <PhoneFrame>
                            {activeStep === 0 && <HomeScreenMockup />}
                            {activeStep === 1 && <PlayerScreenMockup />}
                            {activeStep === 2 && <LibraryScreenMockup />}
                        </PhoneFrame>
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- COMPONENT: The Phone Frame ---
function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-[320px] h-[650px] bg-[#0A0C02] rounded-[3rem] border-[6px] border-[#1a1f2b] shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* The Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1f2b] rounded-b-2xl z-50"></div>

            {/* Status Bar Mock */}
            <div className="absolute top-2 right-5 z-40 flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-white/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-white/20"></div>
            </div>

            {/* Screen Content */}
            <div className="w-full h-full bg-[#0A0C02] overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}

// --- SCREEN 1: HOME (Matched to your React Native Home Screen) ---
function HomeScreenMockup() {
    return (
        <div className="pt-12 px-4 pb-5 h-full flex flex-col bg-[#0A0C02] animate-in fade-in zoom-in-95 duration-500">
            {/* Header (HomeHeader.tsx) */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium mb-1">Selam, Wegene 👋</p>
                    <div className="flex items-baseline">
                        <h3 className="text-white text-xl font-serif tracking-tight">Zeme<span className="text-[#D4F479]">romo</span></h3>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-1"></div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-[#1a1f2b]">
                        <Search size={16} className="text-white" />
                    </div>
                    <div className="w-9 h-9 rounded-full border-[1.5px] border-[#10B981] p-[2px]">
                        <div className="w-full h-full bg-[#10B981] rounded-full flex items-center justify-center">
                            <User size={14} className="text-black" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="mb-3 px-1">
                <h4 className="text-white text-base font-bold">Featured</h4>
            </div>

            {/* Featured Card (FeaturedCard.tsx) */}
            <div className="bg-gradient-to-br from-[#10B981] to-black p-4 rounded-[16px] relative overflow-hidden mb-8 border border-white/10 h-44 flex flex-col justify-between ml-1 mr-2 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f131a]/60 to-[#0f131a]/95"></div>

                <div className="flex justify-between items-center relative z-10">
                    <span className="bg-[#D4F479] text-black text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Single</span>
                    <span className="bg-black/60 border border-white/10 text-white/80 text-[9px] font-medium px-2 py-1 rounded">#Worship</span>
                </div>

                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <h2 className="text-white text-[20px] font-bold mb-1 tracking-tight">Yemaynewot</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-white bg-[#2C3240]"></div>
                            <p className="text-white/80 text-[11px] font-medium">Hossana Choir</p>
                        </div>
                    </div>
                    <div className="w-[38px] h-[38px] rounded-full bg-[#D4F479] flex items-center justify-center shadow-lg">
                        <PlayCircle size={20} className="text-black ml-0.5" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Fresh Arrivals (SongRow.tsx) */}
            <div className="px-1">
                <h4 className="text-white text-base font-bold mb-4">Fresh Arrivals</h4>
                {[
                    { title: "Maranatha", artist: "Bethel Worship", time: "4:30", active: true },
                    { title: "Kiber Yihun", artist: "Assegid Mekonnen", time: "5:12", active: false },
                    { title: "Selam", artist: "Dagi D", time: "3:45", active: false }
                ].map((song, i) => (
                    <div key={i} className={`flex items-center gap-3 mb-1 p-2 rounded-xl transition-colors ${song.active ? 'bg-[#D4F479]/5' : ''}`}>
                        <div className={`w-11 h-11 rounded-lg bg-[#2C3240] flex flex-shrink-0 relative ${song.active ? 'border-[1.5px] border-[#D4F479]' : ''}`}>
                            {song.active && (
                                <div className="absolute inset-0 bg-[#D4F479]/60 flex items-center justify-center rounded-lg">
                                    <div className="w-1 h-3 bg-black mx-[1px] rounded-full animate-pulse"></div>
                                    <div className="w-1 h-4 bg-black mx-[1px] rounded-full animate-pulse delay-75"></div>
                                    <div className="w-1 h-2 bg-black mx-[1px] rounded-full animate-pulse delay-150"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-2">
                            <h4 className={`text-[14px] font-medium mb-0.5 ${song.active ? 'text-[#D4F479]' : 'text-white'}`}>{song.title}</h4>
                            <div className="flex items-center text-[11px] text-[#9CA3AF]">
                                <span>{song.artist}</span>
                                <span className="mx-1.5 opacity-60">•</span>
                                <span>{song.time}</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 flex flex-shrink-0 items-center justify-center">
                            <PlayCircle size={24} className={song.active ? 'text-[#D4F479]' : 'text-[#9CA3AF]'} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- SCREEN 2: PLAYER (Matched to PlayerScreen.tsx) ---
function PlayerScreenMockup() {
    return (
        <div className="relative h-full flex flex-col pt-10 animate-in slide-in-from-right-10 duration-500 overflow-hidden">
            {/* Blurred Background (Like your mobile app) */}
            <div className="absolute inset-0 bg-[#10B981]/20 opacity-80 blur-[60px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#07080b]/30 via-[#07080b]/80 to-[#07080b]"></div>

            <div className="relative z-10 flex flex-col h-full px-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <ChevronDown className="text-white" size={28} />
                    <div className="text-center">
                        <p className="text-white/60 text-[9px] tracking-[1px] uppercase font-medium">Playing from Album</p>
                        <p className="text-white text-[12px] font-bold mt-0.5">Single</p>
                    </div>
                    <MoreHorizontal className="text-white" size={28} />
                </div>

                {/* Artwork */}
                <div className="mb-8 flex justify-center">
                    <div className="w-56 h-56 bg-[#1a1f2b] rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center">
                        <PlayCircle size={48} className="text-white/20" />
                    </div>
                </div>

                {/* Track Info */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-white text-2xl font-bold mb-1">Yemaynewot</h2>
                        <p className="text-white/70 text-[15px] font-medium">Hossana Choir</p>
                    </div>
                    <Heart size={26} className="text-[#10B981]" fill="#10B981" />
                </div>

                {/* Slider */}
                <div className="mb-4">
                    <div className="w-full h-1 bg-white/20 rounded-full mb-3 relative">
                        <div className="w-1/3 h-full bg-white rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-white/50 font-medium">
                        <span>1:24</span>
                        <span>4:12</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <Shuffle size={20} className="text-white/50" />
                    <SkipBack size={32} className="text-white fill-current" />
                    <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-lg">
                        <PlayCircle size={32} className="text-black ml-1" fill="currentColor" />
                    </div>
                    <SkipForward size={32} className="text-white fill-current" />
                    <Repeat size={20} className="text-[#D4F479]" />
                </div>

                {/* Lyrics Card */}
                <div className="bg-white/10 rounded-[16px] p-5 backdrop-blur-sm border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-white font-bold text-[14px]">Lyrics</p>
                        <div className="bg-black/30 p-1.5 rounded-full">
                            <Maximize2 size={12} className="text-white" />
                        </div>
                    </div>
                    <p className="text-white/90 font-serif text-[15px] leading-[24px] font-bold">
                        "Anten yemaynewot,<br />
                        Simen yemaynewot,<br />
                        Yelelm..."
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- SCREEN 3: LIBRARY (Matched to the new dark theme logic) ---
function LibraryScreenMockup() {
    return (
        <div className="pt-12 px-5 h-full bg-[#0A0C02] animate-in fade-in duration-500">
            <h2 className="text-white text-[26px] font-bold mb-5 tracking-tight">Your Library</h2>

            {/* Filter Pills (FilterPills.tsx style) */}
            <div className="flex gap-2 mb-6 overflow-hidden">
                <span className="px-5 py-2 bg-[#10B981] text-white text-[12px] font-medium rounded-full">Playlists</span>
                <span className="px-5 py-2 bg-[#1a1f2b] text-[#9CA3AF] text-[12px] font-medium rounded-full border border-transparent">Downloads</span>
                <span className="px-5 py-2 bg-[#1a1f2b] text-[#9CA3AF] text-[12px] font-medium rounded-full border border-transparent">Albums</span>
            </div>

            {/* List */}
            <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-[52px] h-[52px] bg-[#1a1f2b] rounded-lg flex items-center justify-center border border-white/5">
                            <Folder size={22} className="text-[#10B981]" />
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-3 pt-1">
                            <h4 className="text-white text-[15px] font-medium mb-1 tracking-tight">Amharic Worship {i}</h4>
                            <div className="flex items-center text-[11px] text-[#9CA3AF]">
                                <span className="text-[#10B981]">Downloaded</span>
                                <span className="mx-1.5">•</span>
                                <span>12 songs</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Download Status */}
            <div className="absolute bottom-6 left-5 right-5 bg-[#1a1f2b]/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4F479]/20 flex items-center justify-center">
                    <Folder size={14} className="text-[#D4F479]" />
                </div>
                <div>
                    <p className="text-white text-[12px] font-medium">Syncing Offline Library...</p>
                    <p className="text-[#9CA3AF] text-[10px]">2 of 15 songs downloaded</p>
                </div>
            </div>
        </div>
    );
}