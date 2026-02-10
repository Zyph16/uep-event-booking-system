"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface EditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
}

const API_BASE = "http://192.168.1.31:5000/api";

export default function EditBookingModal({ isOpen, onClose, booking, onSuccess }: EditBookingModalProps) {
    const [formData, setFormData] = useState({
        facilityID: "",
        date_start: "",
        date_end: "",
        time_start: "",
        time_end: ""
    });
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            setFormData({
                facilityID: booking.facilityID.toString(),
                date_start: booking.date_start ? booking.date_start.split('T')[0] : "",
                date_end: booking.date_end ? booking.date_end.split('T')[0] : "",
                time_start: booking.time_start || "",
                time_end: booking.time_end || ""
            });

            // Fetch facilities for dropdown
            const fetchFacilities = async () => {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/facilities`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setFacilities(data.facilities || []);
            };
            fetchFacilities();
        }
    }, [isOpen, booking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/bookings/${booking.bookingID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Failed to update booking");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    return (
        <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"}`}>

                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1f3c88]">Edit Booking</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Facility</label>
                        <select
                            value={formData.facilityID}
                            onChange={(e) => setFormData({ ...formData, facilityID: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all font-medium"
                            required
                        >
                            {facilities.map(f => (
                                <option key={f.facilityID} value={f.facilityID}>{f.facility_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.date_start}
                                onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all font-medium text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">End Date</label>
                            <input
                                type="date"
                                value={formData.date_end}
                                onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all font-medium text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Time Start</label>
                            <input
                                type="time"
                                value={formData.time_start}
                                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all font-medium text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Time End</label>
                            <input
                                type="time"
                                value={formData.time_end}
                                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all font-medium text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all font-sans uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-[#1f3c88] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#152a5f] disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-sans uppercase tracking-widest"
                        >
                            <Save size={18} />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
