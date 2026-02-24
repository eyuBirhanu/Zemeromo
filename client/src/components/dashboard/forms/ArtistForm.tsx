"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mic2, Users, Save, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import TagInput from "@/components/ui/TagInput";
import Select from "@/components/ui/Select"; // Ensure this is imported
import { useAuth } from "@/context/AuthContext";

const artistSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    isGroup: z.boolean(),
    membersCount: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

type ArtistFormData = z.infer<typeof artistSchema>;

interface ArtistFormProps {
    artistId?: string;
}

export default function ArtistForm({ artistId }: ArtistFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const isEditMode = !!artistId;
    const isSuperAdmin = user?.role === 'super_admin';

    // State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Super Admin: Church Selection State
    const [churches, setChurches] = useState<{ value: string; label: string }[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);

    const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ArtistFormData>({
        resolver: zodResolver(artistSchema),
        defaultValues: {
            isGroup: false,
            tags: [],
            membersCount: "1"
        }
    });

    const isGroup = watch("isGroup");

    // --- EFFECT 1: Load Churches (Super Admin Only) ---
    useEffect(() => {
        if (isSuperAdmin) {
            api.get("/churches?status=verified")
                .then(res => {
                    const options = res.data.data.map((c: any) => ({
                        value: c._id,
                        label: `${c.name} (${c.address.city})`
                    }));
                    setChurches(options);
                })
                .catch(err => console.error("Failed to load churches", err));
        }
    }, [isSuperAdmin]);

    // --- EFFECT 2: Load Artist Data (Edit Mode) ---
    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            api.get(`/artists/${artistId}`).then(res => {
                const data = res.data.data;

                // If Super Admin, set the church ID so the dropdown shows correct value
                if (isSuperAdmin && data.churchId) {
                    // Handle case where churchId is an object or a string
                    setSelectedChurchId(data.churchId._id || data.churchId);
                }

                reset({
                    name: data.name,
                    description: data.description,
                    isGroup: data.isGroup,
                    membersCount: String(data.membersCount || 1),
                    tags: data.tags || []
                });
                setExistingImage(data.imageUrl);
            }).finally(() => setIsLoading(false));
        }
    }, [artistId, isEditMode, reset, isSuperAdmin]);

    const onSubmit = async (data: ArtistFormData) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("isGroup", String(data.isGroup));

            if (data.isGroup && data.membersCount) {
                formData.append("membersCount", data.membersCount);
            }
            if (data.description) formData.append("description", data.description);

            // Handle Tags
            if (data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => formData.append("tags[]", tag));
            }

            // Handle Image
            if (imageFile) formData.append("image", imageFile);

            // Handle Church ID (Super Admin)
            if (isSuperAdmin) {
                if (!selectedChurchId) {
                    toast.error("Please assign a Church to this artist");
                    return;
                }
                formData.append("churchId", selectedChurchId);
            }

            const endpoint = isEditMode ? `/artists/${artistId}` : "/artists";
            const method = isEditMode ? api.put : api.post;

            await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

            toast.success(isEditMode ? "Artist Updated" : "Artist Created");
            router.back();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    if (isLoading) {
        return <div className="p-20 text-center"><Loader2 className="animate-spin text-accent mx-auto" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        {isGroup ? <Users size={24} /> : <Mic2 size={24} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-white">
                            {isEditMode ? "Edit Profile" : "New Artist"}
                        </h1>
                        <p className="text-gray-400">
                            {isGroup ? "Create a choir profile." : "Create a solo artist profile."}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#1a1f2b] border border-white/5 rounded-2xl p-8 space-y-8 animate-in fade-in duration-500">

                {/* --- SUPER ADMIN: CHURCH SELECTOR --- */}
                {isSuperAdmin && (
                    <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl mb-4">
                        <label className="text-sm text-accent mb-2 block font-semibold">Step 1: Select Church Owner</label>
                        <Select
                            label=""
                            options={churches}
                            // FIX: Convert null to "" to satisfy Typescript
                            value={selectedChurchId || ""}
                            onChange={setSelectedChurchId}
                            placeholder="Search for a Church..."
                        />
                    </div>
                )}

                {/* Artist Type Toggle */}
                <div className="bg-white/[0.03] p-1.5 rounded-xl flex">
                    <Controller
                        name="isGroup"
                        control={control}
                        render={({ field }) => (
                            <>
                                <button
                                    type="button"
                                    onClick={() => field.onChange(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${!field.value ? "bg-accent text-dark-bg shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    <Mic2 size={16} /> Solo Singer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => field.onChange(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${field.value ? "bg-accent text-dark-bg shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    <Users size={16} /> Choir / Team
                                </button>
                            </>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-[200px_1fr] gap-8">
                    <div>
                        <ImageUpload
                            label={isGroup ? "Choir Photo" : "Profile Picture"}
                            onChange={setImageFile}
                            previewUrl={existingImage || undefined}
                        />
                    </div>

                    <div className="space-y-5">
                        <Input
                            label="Name"
                            placeholder={isGroup ? "e.g. Hossana Mulu Wangel Choir B" : "e.g. Dawit Getachew"}
                            {...register("name")}
                            error={errors.name?.message}
                        />

                        {isGroup && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Number of Members"
                                    type="number"
                                    placeholder="e.g. 25"
                                    {...register("membersCount")}
                                />
                            </div>
                        )}

                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <TagInput
                                    label="Tags"
                                    placeholder="Type and hit Enter (e.g. Worship, Live)"
                                    value={field.value || []}
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Biography</label>
                            <textarea
                                {...register("description")}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-accent/50 min-h-[120px]"
                                placeholder="Write a short bio..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-accent text-dark-bg font-bold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEditMode ? "Save Profile" : "Create Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}