import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">
                    {label}
                </label>
                <div className="relative group">
                    {/* Icon Position */}
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors duration-300">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 
              text-white placeholder:text-gray-600 outline-none transition-all duration-300
              focus:border-accent/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_-5px_rgba(212,244,121,0.1)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-12" : ""}
              ${error ? "border-red-500/50 focus:border-red-500" : ""}
              ${className}
            `}
                        {...props}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs ml-1 animate-in slide-in-from-left-2">
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;