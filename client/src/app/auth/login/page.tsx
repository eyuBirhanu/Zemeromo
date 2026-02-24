"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import AuthLayout from "@/components/auth/AuthLayout"; // Import Layout

const loginSchema = z.object({
    identifier: z.string().min(3, "Please enter email or phone"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const isEmail = data.identifier.includes("@");
            const payload = {
                password: data.password,
                email: isEmail ? data.identifier : undefined,
                phoneNumber: !isEmail ? data.identifier : undefined
            };

            const res = await api.post("/auth/login", payload);
            const { token, user } = res.data;

            if (user.role !== "super_admin" && user.role !== "church_admin") {
                toast.error("Access Denied", { description: "Administrative privileges required." });
                return;
            }

            login(token, user);
            toast.success("Welcome back!");
            router.push("/dashboard");

        } catch (err: any) {
            const msg = err.response?.data?.message || "Login failed.";
            toast.error("Error", { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your credentials to access the dashboard."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="Email or Phone Number"
                    placeholder="user@church.com or +251..."
                    icon={<UserIcon size={18} />}
                    {...register("identifier")}
                    error={errors.identifier?.message}
                />

                <div className="space-y-1">
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        {...register("password")}
                        error={errors.password?.message}
                    />
                    <div className="flex justify-end">
                        <Link href="/auth/forgot-password" className="text-xs text-gray-500 hover:text-accent">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group bg-accent hover:bg-accent-hover text-dark-bg font-bold py-4 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                        <>Access Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </form>

            <div className="pt-8 border-t border-white/5 text-center lg:text-left">
                <p className="text-sm text-gray-500">
                    New Church?{" "}
                    <Link href="/auth/register" className="text-white font-semibold hover:text-accent transition-colors">
                        Register Here
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}