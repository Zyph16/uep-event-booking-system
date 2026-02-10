"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Eye,
    Edit2,
    Calendar as CalendarIcon
} from "lucide-react";
import BookingDetailModal from "@/components/pm/BookingDetailModal";
import EditBookingModal from "@/components/pm/EditBookingModal";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PMReports() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    // Modal States
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            if (!token || !userData) return;

            const user = JSON.parse(userData);

            const res = await fetch(`${API_BASE}/bookings/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const allBookings = data.bookings || [];

            let pmFiltered = allBookings;
            // 1. Filter by Assigned Facility
            if (user.role_name === "PROJECT MANAGER" && user.assigned_facilities) {
                const allowed = user.assigned_facilities.map(Number);
                pmFiltered = allBookings.filter((b: any) => allowed.includes(Number(b.facilityID)));
            }

            // 2. Filter by Finalized Status (Approved, Rejected, Cancelled)
            // The Reports page should only show historical/finalized records
            const reportStatuses = ['approved', 'rejected', 'cancelled'];
            pmFiltered = pmFiltered.filter((b: any) => reportStatuses.includes((b.status || '').toLowerCase()));

            setBookings(pmFiltered);
            setFilteredBookings(pmFiltered);
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

        if (activeFilter === "week") {
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            result = result.filter(b => {
                const date = new Date(b.date_start || b.date_requested);
                return date >= now && date <= weekFromNow;
            });
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.user_name || "").toLowerCase().includes(q) ||
                (b.facility_name || "").toLowerCase().includes(q) ||
                (b.organization || "").toLowerCase().includes(q) ||
                (b.status || "").toLowerCase().includes(q)
            );
        }

        setFilteredBookings(result);
    }, [activeFilter, searchQuery, bookings]);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading reports...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === "all" ? "bg-[#1f3c88] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        All Activity
                    </button>
                    <button
                        onClick={() => setActiveFilter("week")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === "week" ? "bg-[#1f3c88] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        This Week
                    </button>
                </div>

                <div className="w-full md:w-[400px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No activity reports found.</td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => {
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
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${b.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => { setSelectedBooking(b); setIsDetailOpen(true); }}
                                                        className="p-2 text-gray-400 hover:text-[#1f3c88] hover:bg-[#1f3c88]/10 rounded-lg transition-all"
                                                        title="View Report"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedBooking(b); setIsEditOpen(true); }}
                                                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Edit Booking"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls Wrapper (Matching legacy layout) */}
            <div className="flex justify-start items-center gap-4 py-4">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed">Previous</button>
                <span className="text-sm font-bold text-gray-400">Page 1 of 1</span>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed">Next</button>
            </div>

            {/* Modals */}
            <BookingDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                booking={selectedBooking}
            />

            <EditBookingModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                booking={selectedBooking}
                onSuccess={() => {
                    alert("Booking updated successfully!");
                    loadData();
                }}
            />
        </div>
    );
}
