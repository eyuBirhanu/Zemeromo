"use client";

import React, { useState, useEffect } from "react";
import {
    Home, PlayCircle, Folder, ChevronRight,
    MoreHorizontal, Heart, Repeat, Shuffle, SkipBack, SkipForward,
    Search, Bell, User
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

    // Auto-slide functionality (Ex: GoFundMe style)
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % FEATURES.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-32 bg-dark-bg overflow-hidden">
            {/* Background Noise & Glow */}
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: The Feature List (GoFundMe Style) */}
                    <div>
                        <h2 className="text-4xl font-bold font-serif text-white mb-6">
                            Your Spiritual <br />
                            <span className="text-gradient">Companion.</span>
                        </h2>
                        <p className="text-gray-400 mb-12 text-lg">
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
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-colors duration-500 ${isActive ? "bg-accent" : "bg-white/10"}`}></div>

                                        {/* Content */}
                                        <div className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}>
                                            <h3 className={`text-xl font-bold mb-2 flex items-center gap-3 ${isActive ? "text-white" : "text-gray-300"}`}>
                                                <span className={`p-2 rounded-lg ${isActive ? "bg-accent text-dark-bg" : "bg-white/5 text-gray-400"}`}>
                                                    {feature.icon}
                                                </span>
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed max-w-sm">
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
        <div className="relative w-[320px] h-[650px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* The Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-50"></div>

            {/* Status Bar Mock */}
            <div className="absolute top-2 right-5 z-40 flex gap-1">
                <div className="w-4 h-4 rounded-full bg-white/20"></div>
                <div className="w-4 h-4 rounded-full bg-white/20"></div>
            </div>

            {/* Screen Content */}
            <div className="w-full h-full bg-[#111827] overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}

// --- SCREEN 1: HOME (Based on your code) ---
function HomeScreenMockup() {
    return (
        <div className="pt-12 px-5 pb-5 h-full flex flex-col bg-[#111827] animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Good Morning,</p>
                    <h3 className="text-white text-xl font-bold">Eyu Birhanu</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Profile" />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 mb-6 overflow-hidden opacity-80">
                <span className="px-4 py-2 bg-accent text-dark-bg text-xs font-bold rounded-full">All</span>
                <span className="px-4 py-2 bg-transparent border border-white/20 text-white text-xs rounded-full">Worship</span>
                <span className="px-4 py-2 bg-transparent border border-white/20 text-white text-xs rounded-full">Mezmur</span>
            </div>

            {/* Featured Card */}
            <div className="bg-primary p-5 rounded-2xl relative overflow-hidden mb-8 shadow-glow">
                <div className="relative z-10">
                    <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold">New Release</span>
                    <h2 className="text-white text-2xl font-bold mt-1 mb-1">Maranatha</h2>
                    <p className="text-white/90 text-sm mb-4">Bethel Worship</p>
                    <button className="bg-black/20 hover:bg-black/30 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <PlayCircle size={12} /> Listen
                    </button>
                </div>
                {/* Decorative Image Circle */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-sm"></div>
            </div>

            {/* Recent List */}
            <div>
                <h4 className="text-white font-bold mb-4">Recently Played</h4>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
                        <div className="flex-1">
                            <div className="h-3 w-32 bg-gray-700 rounded mb-2"></div>
                            <div className="h-2 w-20 bg-gray-800 rounded"></div>
                        </div>
                        <PlayCircle size={16} className="text-accent" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- SCREEN 2: PLAYER (Redesigned UI) ---
function PlayerScreenMockup() {
    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-[#111827] pt-12 animate-in slide-in-from-right-10 duration-500">
            {/* Top Bar */}
            <div className="px-6 flex justify-between items-center mb-8 text-white/50">
                <div className="w-8 h-1 bg-white/20 rounded-full mx-auto"></div>
            </div>

            {/* Album Art */}
            <div className="px-8 mb-8">
                <div className="aspect-square bg-gray-700 rounded-2xl shadow-2xl relative overflow-hidden group">
                    {/* Placeholder Gradient Art */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={48} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Song Info */}
            <div className="px-8 mb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-white text-2xl font-bold mb-1">Yemaynewot</h2>
                        <p className="text-accent text-sm font-medium">Hossana Choir A</p>
                    </div>
                    <Heart size={20} className="text-white/30" />
                </div>
            </div>

            {/* Progress */}
            <div className="px-8 mb-6">
                <div className="w-full h-1 bg-white/10 rounded-full mb-2">
                    <div className="w-1/3 h-full bg-accent rounded-full shadow-[0_0_10px_rgba(212,244,121,0.5)] relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>1:24</span>
                    <span>4:12</span>
                </div>
            </div>

            {/* Controls */}
            <div className="px-8 flex justify-between items-center mb-8">
                <Shuffle size={18} className="text-white/30" />
                <SkipBack size={24} className="text-white" />
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-glow hover:scale-105 transition-transform text-dark-bg">
                    <PlayCircle size={28} fill="currentColor" />
                </div>
                <SkipForward size={24} className="text-white" />
                <Repeat size={18} className="text-white/30" />
            </div>

            {/* Lyrics Peek */}
            <div className="flex-1 bg-white/5 rounded-t-3xl p-6 backdrop-blur-sm">
                <p className="text-center text-xs text-accent uppercase tracking-widest font-bold mb-4">Lyrics</p>
                <p className="text-white/80 text-center font-serif leading-relaxed text-sm">
                    "Anten yemaynewot,<br />
                    Simen yemaynewot,<br />
                    Yelelm..."
                </p>
            </div>
        </div>
    );
}

// --- SCREEN 3: LIBRARY ---
function LibraryScreenMockup() {
    return (
        <div className="pt-12 px-5 h-full bg-[#111827] animate-in fade-in duration-500">
            <h2 className="text-white text-2xl font-bold mb-6">My Library</h2>

            {/* Tabs */}
            <div className="flex bg-gray-800 p-1 rounded-xl mb-6">
                <div className="flex-1 py-2 text-center text-xs font-bold text-gray-400">Downloads</div>
                <div className="flex-1 py-2 text-center text-xs font-bold bg-white text-black rounded-lg shadow-sm">On Device</div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4 text-primary group-hover:bg-accent group-hover:text-dark-bg transition-colors">
                            <PlayCircle size={18} />
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-3 group-hover:border-transparent">
                            <h4 className="text-white text-sm font-medium mb-1">Amharic Worship Vol {i}</h4>
                            <p className="text-gray-500 text-xs">Audio • 4:30</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Download Status */}
            <div className="mt-8 bg-gray-800/50 p-4 rounded-xl border border-dashed border-gray-700 text-center">
                <Folder className="mx-auto text-gray-500 mb-2" size={20} />
                <p className="text-gray-500 text-xs">Syncing offline...</p>
            </div>
        </div>
    );
}