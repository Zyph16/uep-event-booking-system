"use client";

import React, { useEffect, useState } from "react";
import {
    User,
    Mail,
    Phone,
    Lock,
    Save,
    Camera
} from "lucide-react";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PresidentProfile() {
    const [user, setUser] = useState<any>(null);
    const [personalInfo, setPersonalInfo] = useState<any>({
        fname: "",
        mname: "",
        lname: "",
        phone: "",
        email: ""
    });
    // New state for displaying data in Hero Card (only updates on save/load)
    const [displayInfo, setDisplayInfo] = useState<any>({
        fname: "",
        mname: "",
        lname: ""
    });

    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            if (!token || !userData) return;

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch Personal Info
            const res = await fetch(`${API_BASE}/personalinfo/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.personalinfo) {
                    const info = {
                        fname: data.personalinfo.fname || "",
                        mname: data.personalinfo.mname || "",
                        lname: data.personalinfo.lname || "",
                        phone: data.personalinfo.phone || "",
                        email: data.personalinfo.email || parsedUser.email || ""
                    };
                    setPersonalInfo(info);
                    setDisplayInfo(info); // Sync display info on load
                } else {
                    setPersonalInfo((prev: any) => ({ ...prev, email: parsedUser.email || "" }));
                }
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        if (passwords.new && passwords.new !== passwords.confirm) {
            setFeedback({ msg: "Passwords do not match", type: "error" });
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            // Update Personal Info
            const piRes = await fetch(`${API_BASE}/personalinfo`, {
                method: "POST", // Backend uses POST for create/update logic in some implementations or specific endpoint
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(personalInfo)
            });

            // Update Password if set
            if (passwords.new) {
                await fetch(`${API_BASE}/users/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ password: passwords.new })
                });
            }

            if (piRes.ok) {
                setFeedback({ msg: "Profile updated successfully!", type: "success" });
                setPasswords({ new: "", confirm: "" });
                setDisplayInfo(personalInfo); // Update display info only on successful save
                // loadData(); // Optional: re-fetch to be sure, but local update is faster
            } else {
                setFeedback({ msg: "Failed to update profile", type: "error" });
            }

        } catch (err) {
            setFeedback({ msg: "An error occurred", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#1f3c88] to-[#0d2b6b]"></div>
                <div className="px-8 pb-8 flex flex-col items-center -mt-16">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                            <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center border-4 border-white overflow-hidden text-[#1f3c88] font-black text-4xl uppercase">
                                {displayInfo.fname ? displayInfo.fname[0] : user?.username?.[0] || "?"}
                                {displayInfo.lname ? displayInfo.lname[0] : ""}
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg text-gray-400 border border-gray-100 cursor-pointer hover:text-[#1f3c88] transition-colors">
                            <Camera size={16} />
                        </div>
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-gray-800">
                        {displayInfo.fname ? `${displayInfo.fname} ${displayInfo.mname ? displayInfo.mname[0] + '.' : ''} ${displayInfo.lname}` : user?.username}
                    </h2>
                    <div className="mt-1 px-4 py-1 bg-blue-50 text-[#1f3c88] text-xs font-black uppercase tracking-widest rounded-full">
                        University President
                    </div>
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-bold border ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {feedback.msg}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                            <User className="text-[#1f3c88]" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">First Name</label>
                                    <input
                                        type="text"
                                        value={personalInfo.fname}
                                        onChange={(e) => setPersonalInfo((prev: any) => ({ ...prev, fname: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] text-sm font-medium text-gray-400"
                                        placeholder="Enter First Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Middle Name</label>
                                    <input
                                        type="text"
                                        value={personalInfo.mname}
                                        onChange={(e) => setPersonalInfo((prev: any) => ({ ...prev, mname: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] text-sm font-medium text-gray-400"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Last Name</label>
                                    <input
                                        type="text"
                                        value={personalInfo.lname}
                                        onChange={(e) => setPersonalInfo((prev: any) => ({ ...prev, lname: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] text-sm font-medium text-gray-400"
                                        placeholder="Enter Last Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="text"
                                        value={personalInfo.phone}
                                        onChange={(e) => setPersonalInfo((prev: any) => ({ ...prev, phone: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] text-sm font-medium text-gray-400"
                                        placeholder="09XXXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="email"
                                        value={personalInfo.email}
                                        onChange={(e) => setPersonalInfo((prev: any) => ({ ...prev, email: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                            <Lock className="text-[#e91e63]" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Security & Password</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-gray-400 italic">Leave password fields blank to keep your current password.</p>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e91e63]/20 focus:border-[#e91e63] text-sm font-medium placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e91e63]/20 focus:border-[#e91e63] text-sm font-medium placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#1f3c88] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-[#0d2b6b] transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Profile Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
