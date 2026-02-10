"use client";

import React, { useEffect, useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Lock,
    Building2,
    Save
} from "lucide-react";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PMProfile() {
    const [user, setUser] = useState<any>(null);
    const [assignedFacilities, setAssignedFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");
                const userData = localStorage.getItem("user");
                if (!token || !userData) return;

                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Fetch all facilities to find the ones assigned
                const res = await fetch(`${API_BASE}/facilities`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                const allFac = data.facilities || [];

                if (parsedUser.assigned_facilities) {
                    const assigned = allFac.filter((f: any) => parsedUser.assigned_facilities.map(Number).includes(Number(f.facilityID)));
                    setAssignedFacilities(assigned);
                }

            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#1f3c88] to-[#0d2b6b]"></div>
                <div className="px-8 pb-8 flex flex-col items-center -mt-16">
                    <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                        <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center border-4 border-white">
                            <User size={64} className="text-[#1f3c88]" />
                        </div>
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-gray-800">{user?.username}</h2>
                    <div className="mt-1 px-4 py-1 bg-blue-50 text-[#1f3c88] text-xs font-black uppercase tracking-widest rounded-full">
                        {user?.role_name}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                        <User className="text-[#1f3c88]" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Account Information</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <Mail className="text-gray-400" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                                <p className="text-sm font-bold text-gray-700">{user?.email || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <Phone className="text-gray-400" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                                <p className="text-sm font-bold text-gray-700">{user?.phone || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <MapPin className="text-gray-400" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Personal Address</p>
                                <p className="text-sm font-bold text-gray-700">{user?.address || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Facilities */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                        <Shield className="text-[#e91e63]" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Assigned Responsibilities</h3>
                    </div>

                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-4 italic">As a Project Manager, you are authorized to manage these facilities: </p>

                        <div className="space-y-3">
                            {assignedFacilities.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">No facilities assigned yet</div>
                            ) : (
                                assignedFacilities.map((fac, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Building2 size={20} className="text-[#1f3c88]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{fac.facility_name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{fac.location}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Placeholder */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <Lock className="text-gray-400" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Security</h3>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                    <div>
                        <p className="font-bold text-gray-800">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Secure your account with an extra layer of protection</p>
                    </div>
                    <button className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase transition-all hover:bg-gray-100">
                        Enable 2FA
                    </button>
                    <button className="px-6 py-2 bg-[#1f3c88] text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-blue-100 transition-all hover:bg-[#0d2b6b]">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}
