"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

// Define the User Type
interface User {
    id: string;
    username: string;
    role: "super_admin" | "church_admin" | "user";
    churchId?: string;
    email?: string;
    phone?: string;
    churchName?: string;
    verificationStatus?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // 1. Check for logged-in user on initial load
    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get("token");
            const savedUser = Cookies.get("user");

            if (token && savedUser) {
                // Determine if we need to validate token with backend (optional but safer)
                // For now, we trust the cookie to speed up UI
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // 2. Login Function
    const login = (token: string, userData: User) => {
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });
        setUser(userData);

        // Redirect logic is handled in the page component usually, 
        // but we ensure state is updated first.
    };

    // 3. Logout Function
    const logout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        setUser(null);
        router.push("/auth/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook for easy usage
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}