"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Church, Save, Loader2, Edit3 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";
import LocationPicker from "@/components/ui/LocationPicker";

const churchSchema = z.object({
    name: z.string().min(3, "Church name is required"),
    denomination: z.string().min(1, "Select a denomination"),
    city: z.string().default("Hossana"),
    subCity: z.string().min(2, "Sub-city/Sefer is required"),
    phone: z.string().min(10, "Valid phone number required"),
    description: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

type ChurchFormData = z.infer<typeof churchSchema>;

interface ChurchFormProps {
    churchId?: string;
}

export default function ChurchForm({ churchId }: ChurchFormProps) {
    const router = useRouter();
    const isEditMode = !!churchId;

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [existingLogo, setExistingLogo] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ChurchFormData>({
        resolver: zodResolver(churchSchema),
        defaultValues: {
            city: "Hossana",
            denomination: "Mekane Yesus"
        }
    });

    const currentLat = watch("lat");
    const currentLng = watch("lng");

    useEffect(() => {
        if (isEditMode) {
            setIsLoadingData(true);
            api.get(`/churches/${churchId}`)
                .then(res => {
                    const data = res.data.data;
                    reset({
                        name: data.name,
                        denomination: data.denomination,
                        city: data.address.city,
                        subCity: data.address.subCity,
                        phone: data.contactPhone,
                        description: data.description,
                        lat: data.address.coordinates?.lat,
                        lng: data.address.coordinates?.lng,
                    });
                    if (data.logoUrl) setExistingLogo(data.logoUrl);
                })
                .catch(() => toast.error("Failed to load church details"))
                .finally(() => setIsLoadingData(false));
        }
    }, [churchId, isEditMode, reset]);

    const onSubmit = async (data: ChurchFormData) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("denomination", data.denomination);
            formData.append("city", data.city);
            formData.append("subCity", data.subCity);
            formData.append("contactPhone", data.phone);

            if (data.description) formData.append("description", data.description);
            if (data.lat !== undefined) formData.append("lat", data.lat.toString());
            if (data.lng !== undefined) formData.append("lng", data.lng.toString());

            // Image must match backend uploadImage.single("logo")
            if (logoFile) {
                formData.append("logo", logoFile);
            }

            if (isEditMode) {
                await api.put(`/churches/${churchId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Church Updated Successfully");
            } else {
                await api.post("/churches", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Church Application Submitted");
            }

            router.push("/dashboard/directory?tab=churches");
            router.refresh();

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation Failed");
        }
    };

    const denominationOptions = [
        { value: "Mekane Yesus", label: "Mekane Yesus" },
        { value: "Kale Heywet", label: "Kale Heywet" },
        { value: "Mulu Wangel", label: "Mulu Wangel" },
        { value: "Meserete Kristos", label: "Meserete Kristos" },
        { value: "Assembly of God", label: "Assembly of God" },
        { value: "Other", label: "Other" },
    ];

    if (isLoadingData) {
        return <div className="p-20 text-center text-gray-400 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm"
                >
                    <ArrowLeft size={16} /> Back to Directory
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        {isEditMode ? <Edit3 size={24} /> : <Church size={24} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-white">
                            {isEditMode ? "Edit Church Details" : "Add New Church"}
                        </h1>
                        <p className="text-gray-400">
                            {isEditMode ? "Update location, contact, or branding." : "Register a local Protestant congregation."}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-[#1a1f2b] p-8 rounded-2xl border border-white/5 animate-in fade-in duration-500">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Church Name"
                            placeholder="e.g. Hossana Mekane Yesus"
                            {...register("name")}
                            error={errors.name?.message}
                        />
                        <Controller
                            name="denomination"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Denomination"
                                    options={denominationOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Contact Phone"
                            placeholder="+251..."
                            {...register("phone")}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="City"
                            {...register("city")}
                            placeholder="Hossana"
                            error={errors.city?.message}
                        />
                    </div>

                    <Input
                        label="Sub-City / Sefer"
                        placeholder="e.g. Sefer A, Near High School"
                        {...register("subCity")}
                        error={errors.subCity?.message}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                        <textarea
                            {...register("description")}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-accent/50 min-h-[100px]"
                            placeholder="Brief history or description..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Branding & Location</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <ImageUpload
                            label="Church Logo"
                            onChange={setLogoFile}
                            previewUrl={existingLogo || undefined}
                        />
                        <LocationPicker
                            lat={currentLat}
                            lng={currentLng}
                            onLocationChange={(newLat, newLng) => {
                                setValue("lat", newLat, { shouldValidate: true });
                                setValue("lng", newLng, { shouldValidate: true });
                            }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-accent text-dark-bg font-bold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEditMode ? "Save Changes" : "Register Church"}
                    </button>
                </div>
            </form>
        </div>
    );
}