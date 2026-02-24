import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Input from "./Input"; // Re-use the base Input logic

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string; // Optional, defaults to "Password"
    error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label = "Password", ...props }, ref) => {
        const [isVisible, setIsVisible] = useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={isVisible ? "text" : "password"}
                    label={label}
                    icon={<Lock size={18} />}
                    {...props}
                />

                {/* Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute right-4 top-[42px] text-gray-500 hover:text-white transition-colors"
                    tabIndex={-1} // Skip tab focusing
                >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;