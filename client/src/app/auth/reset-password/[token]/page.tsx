"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, ArrowRight } from "lucide-react";

import PasswordInput from "@/components/ui/PasswordInput";
import AuthLayout from "@/components/auth/AuthLayout";
import api from "@/lib/api";

const resetSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormValues) => {
        setIsLoading(true);
        try {
            await api.put(`/auth/reset-password/${token}`, { password: data.password });
            toast.success("Password Updated!", { description: "You can now log in with your new password." });
            router.push("/auth/login");
        } catch (err: any) {
            toast.error("Failed to reset", { description: err.response?.data?.message || "Token may be invalid or expired." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create New Password"
            subtitle="Your identity has been verified. Enter your new password below."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <PasswordInput
                    label="New Password"
                    {...register("password")}
                    error={errors.password?.message}
                />

                <PasswordInput
                    label="Confirm New Password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group bg-accent hover:bg-accent-hover text-dark-bg font-bold py-4 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Save Password"}
                    {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>
        </AuthLayout>
    );
}