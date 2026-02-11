"use client";

import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, Plus } from "lucide-react";
import UserModal from "@/components/admin/users/UserModal";
import RoleModal from "@/components/admin/users/RoleModal";
import Modal from "@/components/shared/Modal";

const API_BASE = "http://192.168.1.31:5000/api";

export default function ManageUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    // Delete
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Feedback Modal State
    const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success"
    });

    const closeFeedback = () => setFeedbackModal({ ...feedbackModal, isOpen: false });

    const showFeedback = (title: string, message: string, type: "success" | "error") => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            const [userRes, roleRes, facRes] = await Promise.all([
                fetch(`${API_BASE}/users`, { headers }),
                fetch(`${API_BASE}/roles`, { headers }),
                fetch(`${API_BASE}/facilities`, { headers })
            ]);

            const userData = await userRes.json();
            const roleData = await roleRes.json();
            const facData = await facRes.json();

            setUsers(userData.users || []);
            setRoles(roleData.roles || []);
            // Fix: Handle both direct array and object wrapper for facilities
            if (Array.isArray(facData)) {
                setFacilities(facData);
            } else {
                setFacilities(facData.facilities || []);
            }

        } catch (err) {
            console.error("Error fetching users data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditUser = async (user: any) => {
        try {
            // Need to fetch full details including assigned facilities
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/users/${user.id || user.userID}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setUserToEdit({ ...data.user, assigned_facilities: data.assigned_facilities });
            setIsUserModalOpen(true);
        } catch (err) {
            alert("Failed to load user details");
        }
    };

    const handleDeleteUser = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/users/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Delete failed");
            setIsDeleteModalOpen(false);
            fetchData();
            showFeedback("Success", "User deleted successfully.", "success");
        } catch (err) {
            setIsDeleteModalOpen(false);
            showFeedback("Error", "Failed to delete user.", "error");
        }
    };

    const saveUser = async (data: any) => {
        const token = localStorage.getItem("token");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        try {
            let res;
            if (userToEdit) {
                res = await fetch(`${API_BASE}/users/${userToEdit.id || userToEdit.userID}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(data)
                });
            } else {
                res = await fetch(`${API_BASE}/users`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(data)
                });
            }

            if (!res.ok) throw new Error("Save failed");

            setIsUserModalOpen(false);
            fetchData();
            showFeedback("Success", `User ${userToEdit ? 'updated' : 'created'} successfully!`, "success");
        } catch (err) {
            showFeedback("Error", `Failed to ${userToEdit ? 'update' : 'create'} user.`, "error");
        }
    };

    const saveRole = async (roleName: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/roles`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: roleName.toUpperCase() })
            });

            if (!res.ok) throw new Error("Save role failed");

            setIsRoleModalOpen(false);
            fetchData();
            showFeedback("Success", `Role "${roleName.toUpperCase()}" created successfully!`, "success");
        } catch (err) {
            showFeedback("Error", "Failed to create role.", "error");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1f3c88] mb-2">Manage Users</h1>
                <p className="text-gray-500">View and manage all registered users in the system.</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1f3c88] text-sm"
                    // Implement local search if needed
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsRoleModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Role
                    </button>
                    <button
                        onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1f3c88] hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add New User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#004080] text-white">
                            <th className="px-6 py-4 text-sm font-semibold">ID</th>
                            <th className="px-6 py-4 text-sm font-semibold">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user: any) => (
                            <tr key={user.id || user.userID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">#{user.id || user.userID}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1f3c88] flex items-center justify-center text-xs font-bold">
                                        {(user.username || user.name || 'U')[0].toUpperCase()}
                                    </div>
                                    {user.username || user.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold border border-gray-200">
                                        {user.role_name || user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${!user.status || user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id || user.userID)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                userToEdit={userToEdit}
                roles={roles}
                facilities={facilities}
                onSave={saveUser}
            />

            <RoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={saveRole}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                type="error"
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete User</button>
                    </div>
                </div>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                isOpen={feedbackModal.isOpen}
                onClose={closeFeedback}
                title={feedbackModal.title}
                type={feedbackModal.type}
            >
                <div>{feedbackModal.message}</div>
            </Modal>
        </div>
    );
}
