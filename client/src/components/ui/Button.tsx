import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isLoading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export default function Button({
    variant = "primary",
    isLoading,
    icon,
    children,
    className = "",
    ...props
}: ButtonProps) {

    const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-900 text-white hover:bg-blue-800 shadow-sm",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        ghost: "text-gray-500 hover:text-blue-900 hover:bg-blue-50"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className="animate-spin">⏳</span> : icon}
            {children}
        </button>
    );
}