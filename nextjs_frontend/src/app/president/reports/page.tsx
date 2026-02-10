"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    Download,
    FileBarChart,
    FileText
} from "lucide-react";
import PresidentBookingDetailModal from "@/components/president/PresidentBookingDetailModal";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PresidentReports() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeRange, setActiveRange] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/bookings/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const allBookings = data.bookings || [];

            // Filter for Finalized Status (Approved, Rejected, Cancelled)
            // The Reports page should only show historical/finalized records
            const reportStatuses = ['approved', 'rejected', 'cancelled'];
            const historyBookings = allBookings.filter((b: any) => reportStatuses.includes((b.status || '').toLowerCase()));

            setBookings(historyBookings);
            setFilteredBookings(historyBookings);
        } catch (err) {
            console.error("Reports Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let result = bookings;

        if (activeRange === "week") {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            result = result.filter(b => new Date(b.date_start || b.date_requested) >= weekAgo);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.user_name || "").toLowerCase().includes(q) ||
                (b.facility_name || "").toLowerCase().includes(q) ||
                (b.purpose || "").toLowerCase().includes(q) ||
                (b.status || "").toLowerCase().includes(q)
            );
        }

        setFilteredBookings(result);
    }, [activeRange, searchQuery, bookings]);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading reports...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FileBarChart size={28} className="text-[#1f3c88]" />
                    Activity Reports
                </h1>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveRange("all")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeRange === "all" ? "bg-white text-[#1f3c88] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        All Activity
                    </button>
                    <button
                        onClick={() => setActiveRange("week")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeRange === "week" ? "bg-white text-[#1f3c88] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        This Week
                    </button>
                </div>

                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date Requested</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Event Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Setup Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Facility</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No activity records found.</td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => {
                                    const status = (b.status || "").toLowerCase();

                                    // Format Helpers
                                    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                                    const formatTime = (t: string) => {
                                        if (!t) return '-';
                                        return new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
                                    };

                                    const eventDates = b.date_start === b.date_end
                                        ? formatDate(b.date_start)
                                        : `${formatDate(b.date_start)} - ${formatDate(b.date_end)}`;

                                    const eventTime = `${formatTime(b.time_start)} - ${formatTime(b.time_end)}`;

                                    const hasSetup = b.setup_date_start;
                                    const setupDates = hasSetup ? (b.setup_date_start === b.setup_date_end ? formatDate(b.setup_date_start) : `${formatDate(b.setup_date_start)} - ${formatDate(b.setup_date_end)}`) : '-';
                                    const setupTime = hasSetup ? `${formatTime(b.setup_time_start)} - ${formatTime(b.setup_time_end)}` : '';

                                    return (
                                        <tr key={b.bookingID} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                                #{b.bookingID}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700">{eventDates}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Total {Math.ceil((new Date(b.date_end).getTime() - new Date(b.date_start).getTime()) / (1000 * 3600 * 24)) + 1} days</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 font-medium">{eventTime}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasSetup ? (
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-700">{setupDates}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">{setupTime}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800 text-sm">{b.user_name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase rounded border border-gray-200">
                                                        {b.user_role || "User"}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{b.user_email || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-[#1f3c88] text-sm">{b.facility_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${status.includes("approved") ? "bg-emerald-100 text-emerald-700" :
                                                    status.includes("pending") ? "bg-amber-100 text-amber-700" :
                                                        status.includes("rejected") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {status.split(" - ")[0]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => { setSelectedBooking(b); setIsDetailOpen(true); }}
                                                    className="p-2 hover:bg-[#1f3c88]/10 text-[#1f3c88] rounded-lg transition-colors"
                                                    title="View Report"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-400 border border-gray-100 italic">
                        No activity records found.
                    </div>
                ) : (
                    filteredBookings.map((b) => {
                        const status = (b.status || "").toLowerCase();
                        const purpose = (b.purpose || "").toLowerCase();
                        let type = "Booking Request";
                        if (purpose.includes("evaluat")) type = "Evaluation";
                        if (purpose.includes("endors")) type = "Endorsement";

                        return (
                            <div
                                key={b.bookingID}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
                                onClick={() => { setSelectedBooking(b); setIsDetailOpen(true); }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-gray-800">{b.user_name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{b.facility_name}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.includes("approved") ? "bg-emerald-100 text-emerald-700" :
                                        status.includes("pending") ? "bg-amber-100 text-amber-700" :
                                            status.includes("rejected") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {status.split(" - ")[0]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase tracking-wide">{type}</span>
                                </div>

                                <div className="text-xs border-t border-gray-50 pt-2 flex justify-between items-center text-gray-600">
                                    <span>
                                        {new Date(b.date_start).toLocaleDateString()} - {new Date(b.date_end).toLocaleDateString()}
                                    </span>
                                    <button className="text-[#1f3c88]">
                                        <FileText size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <PresidentBookingDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                booking={selectedBooking}
                onStatusUpdate={() => { }} // No updates allowed from reports
            />
        </div>
    );
}
