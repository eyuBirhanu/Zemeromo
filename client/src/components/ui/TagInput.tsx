"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
    label: string;
    value: string[]; // Controlled state (Array of strings)
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}

export default function TagInput({ label, value = [], onChange, placeholder, error }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    // 1. Add Tag Logic
    const addTag = (text: string) => {
        const trimmed = text.trim();
        // Prevent empty or duplicate tags
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue("");
        }
    };

    // 2. Handle Typing (Detect Comma)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // If user types a comma, extract the text before it
        if (val.includes(",")) {
            const parts = val.split(",");
            parts.forEach((part) => {
                if (part.trim()) addTag(part);
            });
            // Clear input (since comma consumed the text)
            setInputValue("");
        } else {
            setInputValue(val);
        }
    };

    // 3. Handle Keys (Enter & Backspace)
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Stop form submission
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            // Remove last tag if input is empty
            const newValue = [...value];
            newValue.pop();
            onChange(newValue);
        }
    };

    // 4. Remove Specific Tag
    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>

            <div className={`
                w-full bg-white/[0.03] border rounded-xl p-2 flex flex-wrap gap-2 transition-all duration-300
                focus-within:border-accent/50 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_20px_-5px_rgba(212,244,121,0.1)]
                ${error ? "border-red-500/50" : "border-white/10"}
            `}>

                {/* Render Chips */}
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium border border-accent/20 animate-in zoom-in-95 duration-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}

                {/* Input Field */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-600 min-w-[120px] px-2 py-1.5 h-full"
                />
            </div>

            {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
        </div>
    );
}