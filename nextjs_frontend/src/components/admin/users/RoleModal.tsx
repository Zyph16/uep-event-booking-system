"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleName: string) => Promise<void>;
}

export default function RoleModal({ isOpen, onClose, onSave }: RoleModalProps) {
    const [roleName, setRoleName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;
        await onSave(roleName);
        setRoleName("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Add New Role</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            placeholder="e.g. Finance Officer"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This will add a new role option to the system. Permissions must be configured separately.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 shadow-sm">
                            Create Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
