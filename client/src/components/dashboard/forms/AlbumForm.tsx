"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Disc, Save, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

// UI Components
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";
import TagInput from "@/components/ui/TagInput";
import { useAuth } from "@/context/AuthContext";

// --- 1. Validation Schema (FIXED: Removed .default() to satisfy TS) ---
const albumSchema = z.object({
    title: z.string().min(2, "Title is required"),
    artistId: z.string().min(1, "Select an artist"),
    releaseYear: z.string().optional(),
    genre: z.string().min(1, "Genre is required"),
    price: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

type AlbumFormData = z.infer<typeof albumSchema>;

interface AlbumFormProps {
    albumId?: string; // If present, we are editing
}

export default function AlbumForm({ albumId }: AlbumFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const isEditMode = !!albumId;
    const isSuperAdmin = user?.role === 'super_admin';

    // --- State ---
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [existingCover, setExistingCover] = useState<string | null>(null);

    // Data Lists
    const [churches, setChurches] = useState<{ value: string; label: string }[]>([]);
    const [artists, setArtists] = useState<{ value: string; label: string }[]>([]);

    // Selection State
    const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // --- Form Hook (FIXED: Added complete defaultValues) ---
    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AlbumFormData>({
        resolver: zodResolver(albumSchema),
        defaultValues: {
            title: "",
            artistId: "",
            genre: "Worship",
            price: "0",
            tags: [],
            description: "",
            releaseYear: ""
        }
    });

    // --- EFFECT 1: Load Churches (Only for Super Admin) ---
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

    // --- EFFECT 2: Load Artists (Dependent on Church ID) ---
    useEffect(() => {
        const fetchArtists = async () => {
            const targetId = isSuperAdmin ? selectedChurchId : user?.churchId;

            if (!targetId) {
                setArtists([]);
                return;
            }

            setIsLoadingData(true);
            try {
                const res = await api.get(`/artists?churchId=${targetId}`);
                const options = res.data.data.map((a: any) => ({
                    value: a._id,
                    label: a.name
                }));
                setArtists(options);
            } catch (error) {
                console.error("Failed to load artists", error);
                toast.error("Could not load artists for this church");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchArtists();
    }, [selectedChurchId, isSuperAdmin, user]);

    // --- EFFECT 3: Load Album Data (If Editing) ---
    useEffect(() => {
        if (isEditMode) {
            api.get(`/albums/${albumId}`).then(res => {
                const data = res.data.data;

                if (isSuperAdmin && data.churchId) {
                    setSelectedChurchId(data.churchId._id || data.churchId);
                }

                reset({
                    title: data.title,
                    artistId: data.artistId?._id || data.artistId,
                    releaseYear: data.releaseYear,
                    genre: data.genre || "Worship",
                    price: data.price !== undefined ? String(data.price) : "0",
                    description: data.description,
                    tags: data.tags || []
                });

                setExistingCover(data.coverImageUrl);
            });
        }
    }, [albumId, isEditMode, isSuperAdmin, reset]);

    // --- Handlers ---
    const handleChurchChange = (churchId: string) => {
        setSelectedChurchId(churchId);
        setValue("artistId", ""); // Reset artist when church changes
    };

    const onSubmit = async (data: AlbumFormData) => {
        try {
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("artistId", data.artistId);
            formData.append("genre", data.genre);
            if (data.price) formData.append("price", data.price);
            if (data.releaseYear) formData.append("releaseYear", data.releaseYear);
            if (data.description) formData.append("description", data.description);

            if (data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => formData.append("tags[]", tag));
            }

            if (isSuperAdmin) {
                if (!selectedChurchId) {
                    toast.error("Please select a church");
                    return;
                }
                formData.append('churchId', selectedChurchId);
            }

            if (coverFile) {
                formData.append("coverImage", coverFile);
            }

            const endpoint = isEditMode ? `/albums/${albumId}` : "/albums";
            const method = isEditMode ? api.put : api.post;

            await method(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success(isEditMode ? "Album Updated" : "Album Created Successfully");
            router.back();
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const genreOptions = [
        { value: "Worship", label: "Worship (Amleko)" },
        { value: "Praise", label: "Praise (Galata)" },
        { value: "Hymn", label: "Hymn" },
        { value: "Choir", label: "Choir Song" },
        { value: "Cover", label: "Cover / Remix" },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <Disc size={24} />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-white">
                        {isEditMode ? "Edit Album" : "Create New Album"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#1a1f2b] border border-white/5 rounded-2xl p-8 space-y-8 animate-in fade-in duration-500">

                <div className="grid md:grid-cols-[250px_1fr] gap-8">
                    <div>
                        <ImageUpload
                            label="Cover Art"
                            onChange={setCoverFile}
                            previewUrl={existingCover || undefined}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Recommended: 1000x1000px (Square)
                        </p>
                    </div>

                    <div className="space-y-6">

                        {/* 1. CHURCH SELECTION (Super Admin Only) */}
                        {isSuperAdmin && (
                            <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl mb-4">
                                <label className="text-sm text-accent mb-2 block font-semibold">Step 1: Select Church Owner</label>
                                <Select
                                    label=""
                                    options={churches}
                                    value={selectedChurchId || ""} // FIXED: Null is now prevented!
                                    onChange={handleChurchChange}
                                    placeholder="Search for a Church..."
                                />
                            </div>
                        )}

                        <Input
                            label="Album Title"
                            placeholder="e.g. Yemaynewot"
                            {...register("title")}
                            error={errors.title?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="artistId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Artist / Choir"
                                        options={artists}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={isLoadingData ? "Loading artists..." : "Select Artist..."}
                                        error={errors.artistId?.message}
                                        disabled={artists.length === 0}
                                    />
                                )}
                            />

                            <Controller
                                name="genre"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Genre"
                                        options={genreOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Release Year"
                                placeholder="e.g. 2024"
                                {...register("releaseYear")}
                            />
                            <Input
                                label="Price (ETB)"
                                type="number"
                                placeholder="0 for Free"
                                {...register("price")}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                        <textarea
                            {...register("description")}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-accent/50 min-h-[100px] transition-all"
                            placeholder="Tell us about this album..."
                        />
                    </div>

                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <TagInput
                                label="Tags"
                                placeholder="Type and press enter..."
                                value={field.value || []}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-400 hover:text-white font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-accent text-dark-bg font-bold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEditMode ? "Save Changes" : "Create Album"}
                    </button>
                </div>
            </form>
        </div>
    );
}