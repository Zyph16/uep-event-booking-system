"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, ShieldAlert, Trash2, List, Plus } from "lucide-react";

interface BlockScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    facilities: any[];
}

const API_BASE = "http://192.168.1.31:5000/api";

export default function BlockScheduleModal({ isOpen, onClose, facilities }: BlockScheduleModalProps) {
    const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
    const [loading, setLoading] = useState(false);
    const [blocks, setBlocks] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        facilityID: "",
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: "",
        reason: "",
        repeatDays: [] as number[]
    });

    const loadBlocks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/bookings/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const allBookings = data.bookings || [];
            // Filter only blocked items
            const blocked = allBookings.filter((b: any) => (b.purpose || "").includes("[BLOCKED]"));
            setBlocks(blocked.sort((a: any, b: any) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'manage') {
            loadBlocks();
        }
    }, [isOpen, activeTab]);

    const handleDayToggle = (day: number) => {
        setFormData(prev => ({
            ...prev,
            repeatDays: prev.repeatDays.includes(day)
                ? prev.repeatDays.filter(d => d !== day)
                : [...prev.repeatDays, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.facilityID || !formData.dateStart || !formData.dateEnd || !formData.timeStart || !formData.timeEnd || !formData.reason) {
            alert("Please fill in all fields.");
            return;
        }

        const start = new Date(formData.dateStart);
        const end = new Date(formData.dateEnd);
        const targetDates: string[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (formData.repeatDays.length > 0 && !formData.repeatDays.includes(dayOfWeek)) {
                continue;
            }
            targetDates.push(d.toISOString().split('T')[0]);
        }

        if (targetDates.length === 0) {
            alert("No dates match your selection.");
            return;
        }

        if (!confirm(`This will create ${targetDates.length} blocked slots. Continue?`)) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let successCount = 0;

            for (const dateStr of targetDates) {
                const payload = {
                    facilityID: formData.facilityID,
                    organization: 'University Admin',
                    purpose: `[BLOCKED] ${formData.reason}`,
                    date_requested: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    date_start: dateStr,
                    date_end: dateStr,
                    time_start: formData.timeStart,
                    time_end: formData.timeEnd,
                    status: 'Approved'
                };

                const res = await fetch(`${API_BASE}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) successCount++;
            }

            alert(`Successfully created ${successCount} blocked slots.`);
            setFormData({
                facilityID: "",
                dateStart: "",
                dateEnd: "",
                timeStart: "",
                timeEnd: "",
                reason: "",
                repeatDays: []
            });
            setActiveTab('manage');
        } catch (err) {
            console.error(err);
            alert("An error occurred while creating blocks.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to cancel this block?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/bookings/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                loadBlocks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white w-full max-w-[700px] max-h-[90vh] rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1f3c88] rounded-xl text-white shadow-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">Block Schedule</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Control Panel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'create' ? "text-[#1f3c88]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <Plus size={14} className="inline mr-2" />
                        Create Blocks
                        {activeTab === 'create' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1f3c88] rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'manage' ? "text-[#1f3c88]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <List size={14} className="inline mr-2" />
                        Manage Existing
                        {activeTab === 'manage' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1f3c88] rounded-t-full"></div>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white">
                    {activeTab === 'create' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Target Facility</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/10 text-sm font-bold appearance-none cursor-pointer"
                                    value={formData.facilityID}
                                    onChange={(e) => setFormData({ ...formData, facilityID: e.target.value })}
                                >
                                    <option value="">Select a facility...</option>
                                    {facilities.map(f => (
                                        <option key={f.facilityID} value={f.facilityID}>{f.facility_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                                        value={formData.dateStart}
                                        onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                                        value={formData.dateEnd}
                                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Repeat on Days</label>
                                <div className="flex gap-2 justify-between">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleDayToggle(idx)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${formData.repeatDays.includes(idx) ? "bg-[#1f3c88] text-white border-[#1f3c88] shadow-md" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Time From</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                                        value={formData.timeStart}
                                        onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Time To</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                                        value={formData.timeEnd}
                                        onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Blocking Reason</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-medium resize-none h-24"
                                    placeholder="Maintenance, Official Event, etc..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1f3c88] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#0d2b6b] transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? "Creating Blocks..." : "Generate Blocked Slots"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {blocks.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <List size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="italic">No active blocks found.</p>
                                </div>
                            ) : (
                                blocks.map((block) => (
                                    <div key={block.bookingID} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-[#1f3c88] text-sm uppercase">{block.facility_name}</span>
                                                <span className="px-2 py-0.5 bg-gray-800 text-white text-[9px] font-black rounded uppercase">Blocked</span>
                                            </div>
                                            <div className="text-xs font-bold text-gray-600 mb-2">
                                                {new Date(block.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {block.time_start} - {block.time_end}</span>
                                            </div>
                                            <div className="mt-2 text-[11px] text-gray-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-100 inline-block">
                                                {block.purpose.replace('[BLOCKED] ', '')}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(block.bookingID)}
                                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
