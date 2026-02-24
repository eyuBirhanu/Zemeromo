import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <ShieldAlert size={40} className="text-red-500" />
            </div>

            <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
                <p className="text-gray-400">
                    You do not have permission to view this section. This area is restricted to Platform Administrators.
                </p>
            </div>

            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
            >
                <ArrowLeft size={18} />
                Return to Dashboard
            </Link>
        </div>
    );
}