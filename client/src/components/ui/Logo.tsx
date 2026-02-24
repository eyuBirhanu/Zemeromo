import { Music2 } from "lucide-react";

export default function Logo() {
    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <Music2
                size={28}
                strokeWidth={2.5}
                className="text-accent group-hover:rotate-12 transition-transform duration-300"
            />

            <span className="text-xl font-bold tracking-tight text-white font-serif">
                Zeme
                <span className="text-accent">romo</span>
            </span>
        </div>
    );
}
