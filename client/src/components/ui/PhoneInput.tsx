import { useState, useEffect, useRef } from "react";
import { ChevronDown, Phone, Search } from "lucide-react";
import { COUNTRY_CODES } from "./countryCodes";

interface PhoneInputProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function PhoneInput({
    label,
    value,
    onChange,
    error,
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter countries
    const filtered = COUNTRY_CODES.filter(
        (c) =>
            c.label.toLowerCase().includes(search.toLowerCase()) ||
            c.code.includes(search)
    );

    // Sync value
    useEffect(() => {
        if (!value) return;

        const match = COUNTRY_CODES.find((c) =>
            value.startsWith(c.code)
        );

        if (match) {
            setSelectedCode(match);
            setPhoneNumber(value.replace(match.code, ""));
        }
    }, [value]);

    const handleNumberChange = (num: string) => {
        setPhoneNumber(num);
        onChange(`${selectedCode.code}${num}`);
    };

    const handleCodeChange = (code: typeof COUNTRY_CODES[0]) => {
        setSelectedCode(code);
        setIsOpen(false);
        setSearch("");
        onChange(`${code.code}${phoneNumber}`);
    };

    // Outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="space-y-2 w-full relative" ref={containerRef}>
            {label && (
                <label className="text-xs font-medium text-gray-400 ml-1">
                    {label}
                </label>
            )}

            <div
                className={`flex items-center bg-white/5 border rounded-xl ${error ? "border-red-500/50" : "border-white/10"
                    }`}
            >
                {/* Dropdown button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-3.5 border-r border-white/10 min-w-[100px]"
                >
                    <span>{selectedCode.flag}</span>
                    <span className="text-sm font-mono">
                        {selectedCode.code}
                    </span>
                    <ChevronDown size={14} />
                </button>

                {/* Phone input */}
                <div className="flex-1 flex items-center px-3">
                    <Phone size={16} className="mr-2" />
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handleNumberChange(e.target.value)}
                        className="w-full bg-transparent outline-none"
                        placeholder="911 234 567"
                    />
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-[#151922] border border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                        {/* Search */}
                        <div className="flex items-center px-3 py-2 border-b border-white/10">
                            <Search size={14} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country..."
                                className="ml-2 w-full bg-transparent outline-none text-sm"
                            />
                        </div>

                        {filtered.map((item) => (
                            <button
                                key={item.code}
                                onClick={() => handleCodeChange(item)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5"
                            >
                                <span>{item.flag}</span>
                                <div>
                                    <p className="text-xs">{item.label}</p>
                                    <p className="text-xs opacity-60">
                                        {item.code}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-400 text-xs ml-1">{error}</p>
            )}
        </div>
    );
}