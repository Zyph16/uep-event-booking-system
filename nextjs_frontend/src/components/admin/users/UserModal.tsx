"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: any;
    roles: any[];
    facilities: any[];
    onSave: (data: any) => Promise<void>;
}

export default function UserModal({
    isOpen,
    onClose,
    userToEdit,
    roles,
    facilities,
    onSave
}: UserModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setUsername(userToEdit.username || userToEdit.name);
                setEmail(userToEdit.email || "");
                setPassword(""); // Don't show password

                // Map Role
                const r = userToEdit.role_name || userToEdit.role || "";
                // Normalize role if needed
                setRole(r);

                // Assigned facilities
                if (userToEdit.assigned_facilities) {
                    setSelectedFacilities(userToEdit.assigned_facilities.map((id: any) => String(id)));
                } else {
                    setSelectedFacilities([]);
                }
            } else {
                setUsername("");
                setEmail("");
                setPassword("");
                setRole("");
                setSelectedFacilities([]);
            }
        }
    }, [isOpen, userToEdit]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!username || !role) {
            alert("Username and Role are required.");
            return;
        }

        const payload: any = {
            username,
            email,
            role,
            facility_ids: selectedFacilities
        };

        if (password) {
            payload.password = password;
        }

        await onSave(payload);
    };

    const toggleFacility = (id: string) => {
        if (selectedFacilities.includes(id)) {
            setSelectedFacilities(selectedFacilities.filter(fid => fid !== id));
        } else {
            setSelectedFacilities([...selectedFacilities, id]);
        }
    };

    const showFacilitySelect = ["project manager", "organizer", "project_manager"].includes(role.toLowerCase());

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">{userToEdit ? "Edit User" : "Add New User"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {userToEdit && <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span>} *
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required={!userToEdit}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            required
                        >
                            {/* Static Common Roles */}
                            <option value="Admin">Admin</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="College Dean">College Dean</option>
                            <option value="Student Council">Student Council</option>
                            <option value="Client">Client</option>

                            {/* Dynamic Roles (De-duplicated) */}
                            {roles.map((r, i) => {
                                const roleName = r.role_name || r.name;
                                const normalized = roleName.toLowerCase();
                                const staticRoles = ["admin", "project manager", "college dean", "student council", "client"];

                                if (!staticRoles.includes(normalized)) {
                                    return <option key={i} value={roleName}>{roleName}</option>;
                                }
                                return null;
                            })}
                        </select>
                    </div>

                    {/* Facility Assignment for Project Managers */}
                    {showFacilitySelect && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Facilities</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {facilities.length === 0 ? (
                                    <p className="text-xs text-gray-500">No facilities available.</p>
                                ) : facilities.map(fac => (
                                    <label key={fac.id || fac.facilityID} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedFacilities.includes(String(fac.id || fac.facilityID))}
                                            onChange={() => toggleFacility(String(fac.id || fac.facilityID))}
                                            className="rounded text-blue-600"
                                        />
                                        {fac.facility_name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[#1f3c88] text-white font-semibold rounded-lg hover:bg-blue-900 shadow-sm">
                            {userToEdit ? "Update User" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
