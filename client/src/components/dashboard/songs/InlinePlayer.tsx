"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";

interface InlinePlayerProps {
    src: string;
}

export default function InlinePlayer({ src }: InlinePlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const skip = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime += seconds;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col gap-3 w-full max-w-xl">
            <audio ref={audioRef} src={src} muted={isMuted} />

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => skip(-10)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="-10s"
                    >
                        <RotateCcw size={18} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-accent text-dark-bg rounded-full flex items-center justify-center hover:bg-accent-hover hover:scale-105 transition-all shadow-glow"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                        onClick={() => skip(10)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="+10s"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>

                {/* Time Display */}
                <span className="text-xs font-mono text-accent">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Mute Toggle */}
                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            {/* Seeker */}
            <div className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div
                    className="h-full bg-accent rounded-full pointer-events-none transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                />
            </div>
        </div>
    );
}