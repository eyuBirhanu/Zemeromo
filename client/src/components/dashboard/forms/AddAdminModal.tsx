"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form"; // Import Controller
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import api from "@/lib/api";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select"; // Import our new component

const adminSchema = z.object({
    username: z.string().min(3, "Name is too short"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    churchId: z.string().min(1, "Please assign a church"),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddAdminModal({ isOpen, onClose, onSuccess }: Props) {
    const [churches, setChurches] = useState<any[]>([]);

    // Note: Added 'control' to destructuring
    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<AdminFormData>({
        resolver: zodResolver(adminSchema),
    });

    useEffect(() => {
        if (isOpen) {
            api.get("/churches").then(res => {
                setChurches(res.data.data);
            }).catch(() => toast.error("Could not load churches"));
        }
    }, [isOpen]);

    const onSubmit = async (data: AdminFormData) => {
        try {
            await api.post("/auth/register-church-admin", data);
            toast.success("Church Admin Created!", { description: `Credentials sent to ${data.email}` });
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error("Failed to create admin", { description: error.response?.data?.message || "Something went wrong" });
        }
    };

    // Format churches for the Select component
    const churchOptions = churches.map(c => ({
        value: c._id,
        label: c.name,
        subLabel: c.location
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Church Admin">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Custom Select using Controller */}
                <Controller
                    name="churchId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Assign Church"
                            options={churchOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Search for a church..."
                            error={errors.churchId?.message}
                        />
                    )}
                />

                <Input
                    label="Full Name"
                    placeholder="e.g. Abebe Kebede"
                    {...register("username")}
                    error={errors.username?.message}
                />

                <Input
                    label="Phone Number"
                    placeholder="+251..."
                    {...register("phoneNumber")}
                    error={errors.phoneNumber?.message}
                />

                <Input
                    label="Email Address"
                    placeholder="admin@church.com"
                    {...register("email")}
                    error={errors.email?.message}
                />

                <PasswordInput
                    label="Password"
                    {...register("password")}
                    error={errors.password?.message}
                />

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 text-sm font-bold bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Create Account
                    </button>
                </div>
            </form>
        </Modal>
    );
}