"use client";

import React, { useState, useEffect } from "react";
import { User, MapPin, Save, Shield } from "lucide-react";
import StatusModal from "@/components/shared/StatusModal";

const API_BASE = "http://192.168.1.31:5000/api";

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "",
        fname: "",
        mname: "",
        lname: "",
        phone: "",
        street: "",
        city: "",
        province: "",
        bookingsCount: 0,
        personalInfoId: null as number | null,
        userId: null as number | null,
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        status: "info" as "success" | "error" | "warning" | "info",
        title: "",
        message: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return; // Handle auth redirect globally or here

                // 1. Get User Data (Role, Email, Username)
                const userRes = await fetch(`${API_BASE}/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!userRes.ok) throw new Error("Failed to fetch user");
                const userResponse = await userRes.json();
                const userData = userResponse.user || userResponse;

                // 2. Get Personal Info
                const infoRes = await fetch(`${API_BASE}/personalinfo/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                let infoData: Record<string, any> = {};
                if (infoRes.ok) {
                    infoData = await infoRes.json();
                }

                // 3. Get Booking Count (Optional, need endpoint)
                // const bookingRes = await fetch(`${API_BASE}/bookings/my`, ...);

                setFormData(prev => {
                    // Personal Info Overwrites
                    // backend returns { personalinfo: { ... } }
                    const pInfo = infoData.personalinfo || {};

                    return {
                        ...prev,
                        userId: userData.id,
                        username: userData.username || "",
                        role: userData.role_name || "User",

                        fname: pInfo.fname || "",
                        mname: pInfo.mname || "",
                        lname: pInfo.lname || "",
                        phone: pInfo.phone || "",
                        street: pInfo.street || "",
                        city: pInfo.city || "",
                        province: pInfo.province || "",
                        personalInfoId: pInfo.personalinfoID || null,

                        // If Personal Info has specific email, use it, else keep User email
                        email: pInfo.email || userData.email || ""
                    };
                });

            } catch (err) {
                console.error("Profile Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            if (formData.password && formData.password !== formData.confirmPassword) {
                setModal({
                    isOpen: true,
                    status: "error",
                    title: "Password Mismatch",
                    message: "The new password and confirmation password do not match."
                });
                setSaving(false);
                return;
            }

            const payload = {
                fname: formData.fname,
                mname: formData.mname,
                lname: formData.lname,
                email: formData.email,
                phone: formData.phone,
                street: formData.street,
                city: formData.city,
                province: formData.province,
                userID: formData.userId // Ensure link to user
            };

            let res;
            if (formData.personalInfoId) {
                // UPDATE
                res = await fetch(`${API_BASE}/personalinfo/${formData.personalInfoId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE
                res = await fetch(`${API_BASE}/personalinfo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error("Failed to save personal info");

            // If Create, get new ID
            if (!formData.personalInfoId) {
                const newData = await res.json();
                if (newData.personalinfoID) {
                    setFormData(prev => ({ ...prev, personalInfoId: newData.personalinfoID }));
                }
            }

            // Password Update (If handled by specific endpoint, add here. 
            // Admin-only User update route might fail for self-update. Skip for now unless confirmed.)

            setModal({
                isOpen: true,
                status: "success",
                title: "Profile Updated",
                message: "Your profile information has been successfully saved."
            });

        } catch (err: any) {
            console.error("Save Error:", err);
            setModal({
                isOpen: true,
                status: "error",
                title: "Save Failed",
                message: err.message || "Failed to save profile changes. Please try again."
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto p-4 md:p-8">

            {/* LEFT SIDEBAR */}
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center sticky top-[100px]">

                    {/* Avatar */}
                    <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#1f3c88] to-[#3b82f6] flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg shadow-blue-900/20">
                        {formData.fname?.[0]}{formData.lname?.[0]}
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {formData.fname} {formData.mname ? `${formData.mname[0]}.` : ""} {formData.lname}
                    </h2>

                    <div className="inline-block bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-6">
                        {formData.role}
                    </div>

                    <div className="w-full pt-6 border-t border-gray-100 grid grid-cols-1 gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-[#1f3c88]">{formData.bookingsCount}</span>
                            <span className="text-xs text-slate-400 font-medium">Total Bookings</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <User className="text-[#1f3c88]" />
                            <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    readOnly
                                    suppressHydrationWarning
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    suppressHydrationWarning
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] focus:ring-2 focus:ring-[#1f3c88]/10 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">First Name</label>
                                <input type="text" name="fname" value={formData.fname} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Middle</label>
                                    <input type="text" name="mname" value={formData.mname} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Last Name</label>
                                    <input type="text" name="lname" value={formData.lname} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <MapPin className="text-[#1f3c88]" />
                            <h3 className="text-lg font-bold text-gray-800">Address</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Street Address</label>
                                <input type="text" name="street" value={formData.street} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">City / Municipality</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Province</label>
                                    <input type="text" name="province" value={formData.province} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <Shield className="text-[#1f3c88]" />
                            <h3 className="text-lg font-bold text-gray-800">Security</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">New Password</label>
                                <input type="password" name="password" placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Confirm Password</label>
                                <input type="password" name="confirmPassword" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} suppressHydrationWarning className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1f3c88] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#1f3c88] to-[#2d4db3] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>

            <StatusModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                status={modal.status}
                title={modal.title}
                message={modal.message}
            />
        </div>
    );
}
