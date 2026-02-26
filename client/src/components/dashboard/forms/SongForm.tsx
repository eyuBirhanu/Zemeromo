"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Music, Save, Loader2, ArrowLeft, Mic2, FileAudio, Users } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";
import TagInput from "@/components/ui/TagInput";
import Toggle from "@/components/ui/Toggle";

// --- 1. Validation Schema (FIXED: Removed .default() to prevent TS mismatch) ---
const songSchema = z.object({
    title: z.string().min(2, "Title is required"),
    lyrics: z.string().min(10, "Lyrics are required"),
    artistId: z.string().min(1, "Artist is required"),
    albumId: z.string().min(1, "Album is required"),
    genre: z.string().min(1, "Genre is required"),
    language: z.string().min(1, "Language is required"),
    writer: z.string().optional(),
    composer: z.string().optional(),
    isCover: z.boolean(),
    originalCredits: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["active", "archived"]),
});

type SongFormData = z.infer<typeof songSchema>;

interface SongFormProps {
    songId?: string;
}

const LANGUAGE_OPTIONS = [
    { value: "Amharic", label: "Amharic" },
    { value: "Afaan Oromo", label: "Afaan Oromo" },
    { value: "Tigrinya", label: "Tigrinya" },
    { value: "Wolaytta", label: "Wolaytta" },
    { value: "Sidama", label: "Sidama" },
    { value: "Hadiyya", label: "Hadiyya" },
    { value: "Somali", label: "Somali" },
    { value: "English", label: "English" },
    { value: "Other", label: "Other (Type it...)" },
];

const GENRE_OPTIONS = [
    { value: "Worship", label: "Worship (Amleko)" },
    { value: "Praise", label: "Praise (Galata)" },
    { value: "Hymn", label: "Hymn" },
    { value: "Choir", label: "Choir Song" },
    { value: "Wedding", label: "Wedding (Serg)" },
    { value: "Holiday", label: "Holiday (Beal)" },
    { value: "Cover", label: "Cover / Remix" },
];

export default function SongForm({ songId }: SongFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const isEditMode = !!songId;

    // Files
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
    const [existingAudioName, setExistingAudioName] = useState<string | null>(null);

    // Lists
    const [churches, setChurches] = useState<{ value: string; label: string }[]>([]);
    const [artists, setArtists] = useState<{ value: string; label: string }[]>([]);
    const [albums, setAlbums] = useState<{ value: string; label: string }[]>([]);

    // Selected States
    const [selectedChurch, setSelectedChurch] = useState<string>("");
    const [customLanguage, setCustomLanguage] = useState("");

    // --- Form Hook (FIXED: Provided complete defaultValues) ---
    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<SongFormData>({
        resolver: zodResolver(songSchema),
        defaultValues: {
            title: "",
            lyrics: "",
            artistId: "",
            albumId: "",
            writer: "",
            composer: "",
            tags: [],
            isCover: false,
            status: "active",
            language: "Amharic",
            genre: "Worship",
            originalCredits: ""
        }
    });

    const watchArtist = watch("artistId");
    const watchIsCover = watch("isCover");
    const watchLanguage = watch("language");

    // --- 1. LOAD INITIAL DATA ---
    useEffect(() => {
        const init = async () => {
            try {
                if (user?.role === 'super_admin') {
                    const res = await api.get("/churches");
                    const options = res.data.data.map((c: any) => ({
                        value: c._id,
                        label: c.name
                    }));
                    setChurches(options);
                }
                else if (user?.role === 'church_admin') {
                    // FIX: Safe access to user.churchId
                    const userChurchId = user.churchId || "";
                    setSelectedChurch(userChurchId);

                    if (userChurchId) {
                        const res = await api.get(`/artists?churchId=${userChurchId}`);
                        const artistOptions = res.data.data.map((a: any) => ({
                            value: a._id,
                            label: a.name
                        }));
                        setArtists(artistOptions);
                    }
                }

                if (isEditMode) {
                    const res = await api.get(`/songs/${songId}`);
                    const song = res.data.data;

                    if (user?.role === 'super_admin') {
                        const churchId = song.churchId?._id || song.churchId;
                        setSelectedChurch(churchId);
                        const artistRes = await api.get(`/artists?churchId=${churchId}`);
                        setArtists(artistRes.data.data.map((a: any) => ({ value: a._id, label: a.name })));
                    }

                    const artistId = song.artistId?._id || song.artistId;
                    const albumRes = await api.get(`/albums?artistId=${artistId}`);
                    setAlbums(albumRes.data.data.map((a: any) => ({ value: a._id, label: a.title })));

                    reset({
                        title: song.title,
                        lyrics: song.lyrics,
                        artistId: artistId,
                        albumId: song.albumId?._id || song.albumId,
                        genre: song.genre,
                        language: song.language,
                        writer: song.credits?.writer || "",
                        composer: song.credits?.composer || "",
                        isCover: song.isCover,
                        originalCredits: song.originalCredits || "",
                        tags: song.tags || [],
                        status: song.status
                    });

                    setExistingThumbnail(song.thumbnailUrl);
                    setExistingAudioName("Current Audio File");
                }

            } catch (error) {
                console.error(error);
                toast.error("Failed to load data");
            }
        };
        init();
    }, [user, isEditMode, songId, reset]);


    // --- 2. HANDLERS ---
    const handleChurchChange = async (churchId: string) => {
        setSelectedChurch(churchId);
        setValue("artistId", "");
        setValue("albumId", "");
        setArtists([]);
        setAlbums([]);

        if (churchId) {
            const res = await api.get(`/artists?churchId=${churchId}`);
            setArtists(res.data.data.map((a: any) => ({ value: a._id, label: a.name })));
        }
    };

    const handleArtistChange = async (artistId: string) => {
        setValue("artistId", artistId);
        setValue("albumId", "");
        setAlbums([]);

        if (artistId) {
            const res = await api.get(`/albums?artistId=${artistId}`);
            setAlbums(res.data.data.map((a: any) => ({ value: a._id, label: a.title })));
        }
    };


    // --- 3. SUBMIT ---
    const onSubmit = async (data: SongFormData) => {
        if (!audioFile && !isEditMode) {
            toast.error("Audio file is required for new songs");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("lyrics", data.lyrics);
            formData.append("genre", data.genre);
            formData.append("language", data.language === "Other" ? customLanguage : data.language);
            formData.append("status", data.status);
            formData.append("artistId", data.artistId);
            formData.append("albumId", data.albumId);

            if (selectedChurch) formData.append("churchId", selectedChurch);

            if (data.writer) formData.append("writer", data.writer);
            if (data.composer) formData.append("composer", data.composer);
            formData.append("isCover", String(data.isCover));
            if (data.originalCredits) formData.append("originalCredits", data.originalCredits);

            if (data.tags) {
                data.tags.forEach(tag => formData.append("tags[]", tag));
            }

            if (audioFile) formData.append("audio", audioFile);
            if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

            const endpoint = isEditMode ? `/songs/${songId}` : "/songs";
            const method = isEditMode ? api.put : api.post;

            await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

            toast.success(isEditMode ? "Song Updated" : "Song Uploaded");
            router.push("/dashboard/songs");

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Operation Failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32">
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Library
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20">
                        <Music size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-white">
                            {isEditMode ? "Edit Song Details" : "Upload New Song"}
                        </h1>
                        <p className="text-gray-400 mt-1">Fill in the details below to publish.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {user?.role === 'super_admin' && (
                    <div className="bg-[#1a1f2b] border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users size={16} /> Owner Organization
                        </h3>
                        <Select
                            label="Select Church"
                            options={churches} // Fixed: Already mapped above
                            value={selectedChurch}
                            onChange={handleChurchChange}
                            placeholder="Choose owner..."
                        />
                    </div>
                )}

                <section className="bg-[#1a1f2b] border border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input label="Song Title" {...register("title")} error={errors.title?.message} />
                        </div>

                        <Controller
                            name="artistId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Artist / Choir"
                                    options={artists} // Fixed: Already mapped above
                                    value={field.value}
                                    onChange={(val) => handleArtistChange(val)}
                                    error={errors.artistId?.message}
                                    placeholder={selectedChurch ? "Select Singer..." : "Select Church First"}
                                    disabled={!selectedChurch}
                                />
                            )}
                        />

                        <Controller
                            name="albumId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Album"
                                    options={albums} // Fixed: Already mapped above
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.albumId?.message}
                                    disabled={!watchArtist}
                                    placeholder={watchArtist ? "Select Album..." : "Select Artist First"}
                                />
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <Controller
                                name="genre"
                                control={control}
                                render={({ field }) => (
                                    <Select label="Genre" options={GENRE_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <div className="space-y-2">
                                <Controller
                                    name="language"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Language"
                                            options={LANGUAGE_OPTIONS}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {watchLanguage === "Other" && (
                                    <Input
                                        label="Specify"
                                        value={customLanguage}
                                        onChange={e => setCustomLanguage(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#1a1f2b] border border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Audio File</label>
                                <div className={`border border-dashed rounded-xl p-6 text-center transition-colors ${audioFile ? "border-accent bg-accent/5" : "border-white/20 hover:border-white/40"}`}>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="audio-upload"
                                    />
                                    <label htmlFor="audio-upload" className="cursor-pointer block">
                                        {audioFile ? (
                                            <div className="text-accent font-medium flex items-center justify-center gap-2">
                                                <FileAudio size={20} /> {audioFile.name}
                                            </div>
                                        ) : (
                                            <div className="text-gray-500">
                                                <Mic2 size={24} className="mx-auto mb-2 opacity-50" />
                                                <span className="text-sm">{existingAudioName ? "Change Audio File" : "Upload MP3"}</span>
                                                {existingAudioName && <p className="text-xs text-green-500 mt-1">Current: {existingAudioName}</p>}
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {!isEditMode && !audioFile && <p className="text-xs text-red-400">Required</p>}
                            </div>

                            <ImageUpload
                                label="Thumbnail"
                                onChange={setThumbnailFile}
                                previewUrl={existingThumbnail || undefined}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Lyrics</label>
                            <textarea
                                {...register("lyrics")}
                                className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:border-accent/50 outline-none resize-none custom-scrollbar leading-relaxed"
                                placeholder={`Enter lyrics here...\n\nVerse 1...`}
                            />
                            {errors.lyrics && <p className="text-xs text-red-400">{errors.lyrics.message}</p>}
                        </div>
                    </div>
                </section>

                <section className="bg-[#1a1f2b] border border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-white/5">
                        <Users size={20} className="text-accent" /> Credits & Metadata
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Writer / Lyrist" {...register("writer")} placeholder="Optional" />
                        <Input label="Composer / Melody" {...register("composer")} placeholder="Optional" />

                        <div className="md:col-span-2">
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <TagInput
                                        label="Search Tags"
                                        placeholder="Type tag and press Enter..."
                                        value={field.value || []}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <Controller
                                name="isCover"
                                control={control}
                                render={({ field }) => (
                                    <Toggle checked={field.value} onChange={field.onChange} />
                                )}
                            />
                            <label className="text-sm font-medium text-gray-300">Is this a Cover Song / Remix?</label>
                        </div>

                        {watchIsCover && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Original Singer / Credit"
                                    placeholder="Who sang the original version?"
                                    {...register("originalCredits")}
                                    className="bg-black/20"
                                />
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-accent text-dark-bg font-bold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 shadow-glow">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEditMode ? "Save Changes" : "Upload & Publish"}
                    </button>
                </div>
            </form>
        </div>
    );
}