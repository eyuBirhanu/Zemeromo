// src/components/ui/SearchableSelect.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";

interface Option {
    value: string;
    label: string;
    subLabel?: string; // e.g. Location
}

interface Props {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder, label }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg cursor-pointer transition-all ${isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"
                    }`}
            >
                <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
                    {selectedOption ? selectedOption.label : placeholder || "Select..."}
                </span>
                <FiChevronDown className="text-gray-500" />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                                            {opt.label}
                                        </p>
                                        {opt.subLabel && (
                                            <p className="text-xs text-gray-500">{opt.subLabel}</p>
                                        )}
                                    </div>
                                    {value === opt.value && <FiCheck className="text-blue-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No results found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}