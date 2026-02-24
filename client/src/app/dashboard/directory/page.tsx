"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Building2, Mic2, Disc, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Toggle from "@/components/ui/Toggle";
import { useSearchParams, useRouter } from "next/navigation";

// Components
import { Table, TableHead, TableHeaderCell, TableRow, TableCell } from "@/components/ui/Table";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";
import ChurchRow from "@/components/dashboard/rows/ChurchRow";
import ArtistRow from "@/components/dashboard/rows/ArtistRow";
import AlbumRow from "@/components/dashboard/rows/AlbumRow";
import AccessDenied from "@/components/dashboard/AccessDenied"; // Import the guard

// Define Tabs with Allowed Roles
const TABS = [
    { id: "churches", label: "Churches", icon: Building2, roles: ["super_admin"] },
    { id: "teams", label: "Choirs & Singers", icon: Mic2, roles: ["super_admin", "church_admin"] },
    { id: "albums", label: "Albums", icon: Disc, roles: ["super_admin", "church_admin"] },
];

export default function DirectoryPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    // 1. Determine Current Tab
    // Default to 'teams' for church_admin if they try to go to root
    const rawTab = searchParams.get("tab");
    let activeTab = rawTab || (user?.role === "super_admin" ? "churches" : "teams");

    // Helper to switch tab
    const setActiveTab = (tab: string) => {
        router.push(`/dashboard/directory?tab=${tab}`);
    };

    //     const handleToggleChurchStatus = async (id: string, currentStatus: string) => {
    //     try {
    //         // Automatically determine the opposite status
    //         const newStatus = currentStatus === "verified" ? "pending" : "verified";

    //         // 1. Send to backend
    //         await api.put(`/churches/${id}/verify`, { status: newStatus });

    //         // 2. Refetch the data so the UI updates!
    //         fetchChurches(); // Or whatever your fetch function is named

    //         toast.success(`Church marked as ${newStatus}`);
    //     } catch (error) {
    //         toast.error("Failed to update church status");
    //     }
    // };
    // 2. Security Check: Is user allowed on this tab?
    const currentTabDef = TABS.find(t => t.id === activeTab);
    const isAllowed = currentTabDef?.roles.includes(user?.role || "");

    // 3. Fetch Logic
    const fetchData = async () => {
        if (!isAllowed) return; // Don't fetch if not allowed

        setIsLoading(true);
        setData([]);
        try {
            let endpoint = "";
            if (activeTab === "churches") endpoint = "/churches";
            else if (activeTab === "teams") endpoint = "/artists";
            else endpoint = "/albums";

            const res = await api.get(endpoint, {
                params: {
                    search,
                    showDeleted: showDeleted
                }
            });
            setData(res.data.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [activeTab, search, showDeleted, user]);

    // 4. Delete Handler
    const handleDelete = async (id: string) => {
        try {
            let endpoint = "";
            if (activeTab === "churches") endpoint = `/churches/${id}`;
            else if (activeTab === "teams") endpoint = `/artists/${id}`;
            else endpoint = `/albums/${id}`;

            await api.delete(endpoint);
            toast.success("Deleted successfully");
            setData(prev => prev.filter(i => i._id !== id));
        } catch {
            toast.error("Delete failed");
        }
    };

    // 5. Dynamic "Add" Button Logic
    const getAddButton = () => {
        if (activeTab === "churches") {
            if (user?.role !== "super_admin") return null;
            return { href: "/dashboard/directory/add-church", label: "Add Church" };
        }
        if (activeTab === "teams") return { href: "/dashboard/directory/add-artist", label: "Add Artist" };
        return { href: "/dashboard/directory/add-album", label: "Add Album" };
    };

    // --- RENDER ---

    // If permission check failed, show Access Denied
    if (!isAllowed && user) {
        return <AccessDenied />;
    }

    const addAction = getAddButton();

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white">Directory</h1>
                    <p className="text-gray-400 mt-1">Manage content and entities.</p>
                </div>

                {addAction && (
                    <Link
                        href={addAction.href}
                        className="flex items-center gap-2 px-5 py-3 bg-accent text-dark-bg rounded-xl font-bold hover:bg-accent-hover transition-transform active:scale-95 shadow-glow"
                    >
                        <Plus size={20} />
                        <span>{addAction.label}</span>
                    </Link>
                )}
            </div>

            {/* TABS (Filtered by Role) */}
            <div className="border-b border-white/10 flex gap-8">
                {TABS.map((tab) => {
                    // Only render tabs the user is allowed to see
                    if (!tab.roles.includes(user?.role || "")) return null;

                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                pb-4 flex items-center gap-2 text-sm font-medium transition-all relative
                                ${isActive ? "text-accent" : "text-gray-500 hover:text-gray-300"}
                            `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full shadow-[0_0_10px_rgba(212,244,121,0.5)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#1a1f2b] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none transition-colors"
                    />
                </div>

                {/* Trash Toggle (Super Admin Only) */}
                {user?.role === "super_admin" && (
                    <div className="flex items-center gap-3 bg-[#1a1f2b] border border-white/10 px-4 py-2 rounded-xl">
                        <span className={`text-xs font-bold uppercase ${showDeleted ? "text-red-400" : "text-gray-500"}`}>
                            Show Deleted
                        </span>
                        <Toggle
                            checked={showDeleted}
                            onChange={() => setShowDeleted(!showDeleted)}
                        />
                    </div>
                )}
            </div>

            {/* CONTENT TABLE */}
            <Table>
                <TableHead>
                    {activeTab === "churches" && (
                        <>
                            <TableHeaderCell>Church Name</TableHeaderCell>
                            <TableHeaderCell>Denomination</TableHeaderCell>
                            <TableHeaderCell>Managed By</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </>
                    )}
                    {activeTab === "teams" && (
                        <>
                            <TableHeaderCell>Artist Name</TableHeaderCell>
                            {user?.role === 'super_admin' && (
                                <TableHeaderCell>Managed By</TableHeaderCell>
                            )}
                            <TableHeaderCell>Affiliation</TableHeaderCell>
                            <TableHeaderCell>Content</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </>
                    )}
                    {activeTab === "albums" && (
                        <>
                            <TableHeaderCell>Album Info</TableHeaderCell>
                            {user?.role === 'super_admin' && (
                                <TableHeaderCell>Managed By</TableHeaderCell>
                            )}
                            <TableHeaderCell>Origin & Genre</TableHeaderCell>
                            <TableHeaderCell>Visibility</TableHeaderCell>
                            <TableHeaderCell>Stats</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </>
                    )}
                </TableHead>

                <tbody>
                    {isLoading ? (
                        <TableRowsSkeleton cols={5} rows={5} />
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <ShieldAlert size={32} className="opacity-50" />
                                    <span>No data found.</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => {
                            if (activeTab === "churches") {
                                return (
                                    <ChurchRow
                                        key={item._id}
                                        church={item}
                                        onToggleStatus={() => { }} // Pass handler if needed
                                        onDelete={() => handleDelete(item._id)} // Simple delete for now
                                    />
                                );
                            }
                            if (activeTab === "teams") {
                                return (
                                    <ArtistRow
                                        key={item._id}
                                        artist={item}
                                        onDelete={() => handleDelete(item._id)}
                                        isSuperAdmin={isSuperAdmin}
                                    />
                                );
                            }
                            if (activeTab === "albums") {
                                return (
                                    <AlbumRow
                                        key={item._id}
                                        album={item}
                                        onDelete={() => handleDelete(item._id)}
                                        isSuperAdmin={isSuperAdmin}
                                    />
                                );
                            }
                            return null;
                        })
                    )}
                </tbody>
            </Table>
        </div>
    );
}