"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FiPlus, FiSearch, FiUsers, FiUser, FiMoreVertical } from "react-icons/fi";
import Button from "@/components/ui/Button";
import SideDrawer from "@/components/ui/SideDrawer";
import ArtistForm from "@/components/dashboard/forms/ArtistForm";

interface Artist {
    _id: string;
    name: string;
    imageUrl?: string;
    isGroup: boolean;
    tags: string[];
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchArtists = async () => {
        setLoading(true);
        try {
            // Ensure this route exists in your backend: router.get("/", getArtists)
            const res = await api.get("/content/artists");
            if (res.data.success) {
                setArtists(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching artists", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArtists(); }, []);

    const filteredArtists = artists.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Artists & Choirs</h1>
                    <p className="text-gray-500">Manage the singers and ministries in the platform.</p>
                </div>
                <Button icon={<FiPlus />} onClick={() => setIsDrawerOpen(true)}>
                    Add Artist / Choir
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Content */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading directory...</div>
            ) : filteredArtists.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FiUsers size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Artists Found</h3>
                    <p className="text-gray-500 mt-1">Add your first singer or choir group.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredArtists.map((artist) => (
                        <div key={artist._id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                            {/* Image Header */}
                            <div className="h-48 overflow-hidden relative bg-gray-100">
                                {artist.imageUrl ? (
                                    <img
                                        src={artist.imageUrl}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FiUser size={48} />
                                    </div>
                                )}

                                {/* Badge: Solo vs Choir */}
                                <div className="absolute top-3 left-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${artist.isGroup ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                        }`}>
                                        {artist.isGroup ? <FiUsers size={10} /> : <FiUser size={10} />}
                                        {artist.isGroup ? "Choir" : "Solo"}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg truncate">{artist.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                        {/* You could add a song count here later */}
                                        No active songs
                                    </span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <FiMoreVertical />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slide Drawer */}
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Add New Artist"
            >
                <ArtistForm onSuccess={() => {
                    setIsDrawerOpen(false);
                    fetchArtists();
                }} />
            </SideDrawer>
        </div>
    );
}