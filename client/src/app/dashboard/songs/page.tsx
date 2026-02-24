"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Music, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import { Table, TableHead, TableHeaderCell } from "@/components/ui/Table";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";
import SongRow from "@/components/dashboard/rows/SongRow";
import Select from "@/components/ui/Select";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function SongsPage() {
    const { user } = useAuth();
    const [songs, setSongs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // --- FILTERS STATE ---
    const [churches, setChurches] = useState<any[]>([]);
    const [artists, setArtists] = useState<any[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);

    const [selectedChurch, setSelectedChurch] = useState("");
    const [selectedArtist, setSelectedArtist] = useState("");
    const [selectedAlbum, setSelectedAlbum] = useState("");

    const [songToDelete, setSongToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string) => {
        setSongToDelete(id);
    };

    const confirmDelete = async () => {
        if (!songToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/songs/${songToDelete}`);
            setSongs(prev => prev.filter(s => s._id !== songToDelete));
            toast.success("Song deleted");
            setSongToDelete(null);
        } catch {
            toast.error("Failed to delete song");
        } finally {
            setIsDeleting(false);
        }
    };

    // 1. Initial Load (Churches/Artists)
    useEffect(() => {
        const loadInit = async () => {
            if (user?.role === "super_admin") {
                const res = await api.get("/churches");
                setChurches(res.data.data);
            } else {
                // For Church Admin, load their artists immediately
                const res = await api.get("/artists");
                setArtists(res.data.data);
            }
        };
        loadInit();
    }, [user]);

    // 2. Cascading Filter Logic
    useEffect(() => {
        if (!selectedChurch) return;
        // If Super Admin selects a church, fetch that church's artists
        api.get(`/artists?churchId=${selectedChurch}`).then(res => setArtists(res.data.data));
    }, [selectedChurch]);

    useEffect(() => {
        if (!selectedArtist) return;
        // Fetch albums for selected artist
        api.get(`/albums?artistId=${selectedArtist}`).then(res => setAlbums(res.data.data));
    }, [selectedArtist]);

    // 3. Main Search Fetcher
    const fetchSongs = async () => {
        setIsLoading(true);
        try {
            const params: any = { search, showDeleted: false };

            // Apply Filters
            if (selectedChurch) params.churchId = selectedChurch;
            if (selectedArtist) params.artistId = selectedArtist;
            if (selectedAlbum) params.albumId = selectedAlbum;

            const res = await api.get("/songs", { params });
            setSongs(res.data.data);
        } catch {
            toast.error("Failed to load songs");
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger fetch when any filter changes
    useEffect(() => {
        // Debounce search could be added here
        fetchSongs();
    }, [search, selectedChurch, selectedArtist, selectedAlbum]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/songs/${id}`);
            setSongs(prev => prev.filter(s => s._id !== id));
            toast.success("Song deleted");
        } catch {
            toast.error("Failed to delete song");
        }
    };

    // Helper for Filters
    const churchOptions = [{ value: "", label: "All Churches" }, ...churches.map(c => ({ value: c._id, label: c.name }))];
    const artistOptions = [{ value: "", label: "All Artists" }, ...artists.map(a => ({ value: a._id, label: a.name }))];
    const albumOptions = [{ value: "", label: "All Albums" }, ...albums.map(a => ({ value: a._id, label: a.title }))];

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white">Songs Library</h1>
                    <p className="text-gray-400 mt-1">Upload, manage, and track analytics.</p>
                </div>
                <Link
                    href="/dashboard/songs/add"
                    className="flex items-center gap-2 px-5 py-3 bg-accent text-dark-bg rounded-xl font-bold hover:bg-accent-hover transition-transform active:scale-95 shadow-glow"
                >
                    <Plus size={20} />
                    <span>Add New Song</span>
                </Link>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-[#1a1f2b] p-4 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                    <Filter size={14} /> Filter Library
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/4 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:border-accent/50 outline-none"
                        />
                    </div>

                    {/* Church Select (Super Admin Only) */}
                    {user?.role === 'super_admin' && (
                        <Select
                            label="Church"
                            options={churchOptions}
                            value={selectedChurch}
                            onChange={(val) => {
                                setSelectedChurch(val);
                                setSelectedArtist(""); // Reset down stream
                                setSelectedAlbum("");
                            }}
                        />
                    )}

                    {/* Artist Select */}
                    <Select
                        label="Artist"
                        options={artistOptions}
                        value={selectedArtist}
                        onChange={(val) => {
                            setSelectedArtist(val);
                            setSelectedAlbum("");
                        }}
                        placeholder="Select Artist"
                    />

                    {/* Album Select */}
                    <Select
                        label="Album"
                        options={albumOptions}
                        value={selectedAlbum}
                        onChange={setSelectedAlbum}
                        placeholder="Select Album"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#1a1f2b]">
                <Table>
                    <TableHead>
                        <TableHeaderCell>Song Details</TableHeaderCell>
                        <TableHeaderCell>Album & Genre</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Featured</TableHeaderCell>
                        <TableHeaderCell>Action</TableHeaderCell>
                    </TableHead>
                    <tbody>
                        {isLoading ? (
                            <TableRowsSkeleton cols={5} rows={5} />
                        ) : songs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Music size={40} className="opacity-30" />
                                        <p>No songs found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            songs.map(song => (
                                <SongRow key={song._id} song={song} onDelete={handleDeleteClick} />
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <ConfirmModal
                isOpen={!!songToDelete}
                onClose={() => setSongToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Song"
                description="Are you sure you want to delete this song? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    );
}