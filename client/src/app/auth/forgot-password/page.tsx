"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, CheckCircle2, ChevronLeft } from "lucide-react";

import Input from "@/components/ui/Input";
import AuthLayout from "@/components/auth/AuthLayout";
import api from "@/lib/api";

const forgotSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotFormValues) => {
        setIsLoading(true);
        try {
            // Simulate API call or connect to real endpoint
            // await api.post("/auth/forgot-password", data);

            // Artificial delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            toast.success("Reset link sent!");
        } catch (err) {
            toast.error("Error", { description: "Could not send reset email. Try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Don't worry, it happens. We'll send you reset instructions."
            quote="He restores my soul. He leads me in paths of righteousness."
            citation="Psalm 23:3"
        >
            {isSubmitted ? (
                // --- SUCCESS STATE ---
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Check your mail</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        We have sent password recovery instructions to your email address.
                    </p>

                    <Link
                        href="/auth/login"
                        className="inline-flex items-center text-accent hover:text-white transition-colors font-medium"
                    >
                        <ChevronLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
            ) : (
                // --- FORM STATE ---
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Email Address"
                        placeholder="admin@church.com"
                        icon={<Mail size={18} />}
                        {...register("email")}
                        error={errors.email?.message}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full group bg-accent hover:bg-accent-hover text-dark-bg font-bold py-4 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                Send Instructions
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}