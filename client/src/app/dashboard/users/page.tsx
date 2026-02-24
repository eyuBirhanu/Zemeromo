"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { useAuth } from "@/context/AuthContext";

// UI Components
import { Table, TableHead, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import AddAdminModal from "@/components/dashboard/forms/AddAdminModal";
import { TableRowsSkeleton } from "@/components/ui/Skeleton"; // Import the skeleton
import { User, ShieldAlert } from "lucide-react";
import AdminRow from "@/components/dashboard/rows/AdminRow";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { user } = useAuth();

    // 1. Fetch Data
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            // Use the specific endpoint for admins
            const res = await api.get("/users/admins");
            setUsers(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch admins");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. Toggle Status
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic Update
        const updatedList = users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u);
        setUsers(updatedList);

        try {
            await api.patch(`/users/${id}/status`);
            toast.success(currentStatus ? "Admin deactivated" : "Admin activated");
        } catch (error) {
            // Revert on error
            toast.error("Failed to update status");
            fetchUsers();
        }
    };

    // 3. Delete Admin
    const handleDeleteClick = (id: string) => {
        setUserToDelete(id); // This opens the modal
    };

    // 2. Triggered when clicking "Yes, Delete" in Modal
    const executeDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/users/${userToDelete}`);
            toast.success("Admin removed successfully");

            // Remove from UI immediately
            setUsers(prev => prev.filter(u => u._id !== userToDelete));

            // Close Modal
            setUserToDelete(null);
        } catch (error) {
            toast.error("Failed to delete admin");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.churchId?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (user?.role !== "super_admin") {
        return <AccessDenied />
    }


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white">Administrators</h1>
                    <p className="text-gray-400 mt-1">Manage church permissions and access.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-accent text-dark-bg rounded-xl font-bold hover:bg-accent-hover transition-transform active:scale-95 shadow-glow"
                >
                    <Plus size={20} />
                    <span>Add New Admin</span>
                </button>
            </div>

            {/* Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or church..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#1a1f2b] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none transition-colors"
                />
            </div>

            {/* Table */}
            <Table>
                <TableHead>
                    {/* NEW: Added # column */}
                    <TableHeaderCell className="w-12">#</TableHeaderCell>
                    <TableHeaderCell>Admin Name</TableHeaderCell>
                    <TableHeaderCell>Church</TableHeaderCell>
                    <TableHeaderCell>Contact</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                </TableHead>
                <tbody>
                    {isLoading ? (
                        <TableRowsSkeleton cols={6} rows={5} /> // Updated cols to 6
                    ) : filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center">
                                {/* Empty State UI */}
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <p className="text-lg font-medium text-white">No admins found</p>
                                    <p className="text-sm">Try adjusting your search or add a new one.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        // NEW: Use the AdminRow component
                        filteredUsers.map((user, index) => (
                            <AdminRow
                                key={user._id}
                                user={user}
                                index={index}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDeleteClick} // Pass the click handler, not the execution
                            />
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal */}
            <AddAdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />
            <ConfirmModal
                isOpen={!!userToDelete} // Open if ID exists
                onClose={() => setUserToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Administrator?"
                description="This will permanently remove the admin's access to the dashboard. The songs and albums they uploaded will remain in the database."
                isLoading={isDeleting}
            />
        </div>
    );
}