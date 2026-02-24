import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

interface Option {
    value: string;
    label: string;
    subLabel?: string; // e.g., Church Location
}

interface SelectProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export default function Select({
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    error,
    disabled = false
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Find active option object for display
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full space-y-2" ref={containerRef}>
            <label className="text-sm font-medium text-gray-400 ml-1">
                {label}
            </label>

            <div className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        w-full flex items-center justify-between bg-white/[0.03] border rounded-xl px-4 py-3.5 text-left transition-all duration-300
                        ${isOpen ? "border-accent/50 bg-white/[0.05]" : "border-white/10"}
                        ${error ? "border-red-500/50" : ""}
                        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-white/20"}
                    `}
                    disabled={disabled}
                >
                    <span className={selectedOption ? "text-white" : "text-gray-500"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : ""}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#151922] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                        {/* Search Input (Only show if > 5 options) */}
                        {options.length > 5 && (
                            <div className="p-2 border-b border-white/5 sticky top-0 bg-[#151922] z-10">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/30"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-500">No results found</div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearchTerm("");
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                                            ${value === opt.value ? "bg-accent/10 text-accent" : "text-gray-300 hover:bg-white/5 hover:text-white"}
                                        `}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{opt.label}</span>
                                            {opt.subLabel && (
                                                <span className="text-[10px] text-gray-500">{opt.subLabel}</span>
                                            )}
                                        </div>
                                        {value === opt.value && <Check size={16} />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-400 text-xs ml-1 animate-in slide-in-from-left-2">{error}</p>
            )}
        </div>
    );
}