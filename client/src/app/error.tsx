"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-dark-bg text-center px-6 overflow-hidden">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="mb-6 p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-400">
                    <AlertTriangle size={48} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-3 font-serif">Something went wrong</h2>

                <p className="text-gray-400 mb-8 text-sm">
                    We encountered an unexpected note in the melody. <br />
                    Please try refreshing the page.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button
                        onClick={() => reset()}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-dark-bg hover:bg-gray-200 font-bold px-6 py-3 rounded-xl transition-all"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </button>

                    <Link
                        href="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all"
                    >
                        <Home size={18} />
                        Go Dashboard
                    </Link>
                </div>

                {/* Technical Error Code (Optional) */}
                {error.digest && (
                    <p className="mt-8 text-xs text-gray-700 font-mono">
                        Error Digest: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}