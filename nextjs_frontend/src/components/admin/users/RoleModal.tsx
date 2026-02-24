"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Edit2 } from "lucide-react";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleData: { id?: number, name: string, role_specification: string }) => Promise<void>;
    roles: any[];
    onDelete: (id: number) => Promise<void>;
}

export default function RoleModal({ isOpen, onClose, onSave, roles, onDelete }: RoleModalProps) {
    const [roleId, setRoleId] = useState<number | null>(null);
    const [roleName, setRoleName] = useState("");
    const [roleType, setRoleType] = useState("Regular");

    const [selectedRoleForAction, setSelectedRoleForAction] = useState<string>("");

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
            setSelectedRoleForAction("");
        }
    }, [isOpen]);

    const resetForm = () => {
        setRoleId(null);
        setRoleName("");
        setRoleType("Regular");
    };

    const handleEditClick = (role: any) => {
        setRoleId(role.id);
        setRoleName(role.role_name || role.name);
        setRoleType(role.role_specification || "Regular Account");
        // We can jump user focus to the form if needed, but it's small enough.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        await onSave({ id: roleId || undefined, name: roleName.trim(), role_specification: roleType });
        resetForm();
    };

    if (!isOpen) return null;

    const selectedRoleData = roles.find(r => r.id.toString() === selectedRoleForAction);
    const staticRoles = ["admin", "university president"];
    const isSelectedSystemRole = selectedRoleData ? staticRoles.includes((selectedRoleData.role_name || selectedRoleData.name).toLowerCase()) : false;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Manage Roles</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {/* View/Edit/Delete Existing Roles */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Existing Roles</h3>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Select a role to manage inline</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 mb-4"
                            value={selectedRoleForAction}
                            onChange={(e) => setSelectedRoleForAction(e.target.value)}
                        >
                            <option value="">-- Choose a Role --</option>
                            {roles.map((r, i) => (
                                <option key={r.id || i} value={r.id}>
                                    {r.role_name || r.name} {isSelectedSystemRole ? '' : `(${r.role_specification || 'Regular Account'})`}
                                </option>
                            ))}
                        </select>

                        {selectedRoleData && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">{selectedRoleData.role_name || selectedRoleData.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Type: <span className="font-medium">{selectedRoleData.role_specification || "Regular Account"}</span>
                                        </div>
                                        {isSelectedSystemRole && (
                                            <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                SYSTEM ROLE (Protected)
                                            </div>
                                        )}
                                    </div>
                                    {!isSelectedSystemRole && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(selectedRoleData)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Edit Role"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete(selectedRoleData.id);
                                                    setSelectedRoleForAction("");
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                                title="Delete Role"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add / Edit Form */}
                    <form onSubmit={handleSubmit} className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            {roleId ? "Edit Role" : "Add New Role"}
                            {roleId && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Editing ID: #{roleId}</span>
                            )}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 mb-4"
                                    value={roleType}
                                    onChange={e => setRoleType(e.target.value)}
                                >
                                    <option value="Regular">Regular Account</option>
                                    <option value="University Account">University Account</option>
                                </select>

                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={roleName}
                                    onChange={e => setRoleName(e.target.value)}
                                    placeholder="e.g. Finance Officer"
                                    required
                                />
                                {!roleId && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        This will add a new role option to the system. Permissions must be configured separately.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                {roleId && (
                                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel Edit</button>
                                )}
                                {!roleId && (
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Close</button>
                                )}
                                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 shadow-sm text-sm">
                                    {roleId ? "Update Role" : "Create Role"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
