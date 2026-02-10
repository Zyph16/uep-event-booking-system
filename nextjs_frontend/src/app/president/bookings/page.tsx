"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    MoreHorizontal,
    FileText,
    CreditCard,
    CheckCircle2,
    Lock
} from "lucide-react";
import PresidentBookingDetailModal from "@/components/president/PresidentBookingDetailModal";
import BlockScheduleModal from "@/components/president/BlockScheduleModal";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PresidentBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFacility, setActiveFacility] = useState("all");
    const [activeWeek, setActiveWeek] = useState(false);
    const [activeType, setActiveType] = useState("all");
    const [facilities, setFacilities] = useState<any[]>([]);

    // Modal States
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Fetch Bookings
            const res = await fetch(`${API_BASE}/bookings/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const allBookings = data.bookings || [];

            // President Filter: Pending (Step 2) or Billing Generated (Step 4)
            const presidentFiltered = allBookings.filter((b: any) => {
                const s = b.status?.toLowerCase() || '';
                return s === 'pending' || s.includes('billing generated');
            });

            setBookings(presidentFiltered);
            setFilteredBookings(presidentFiltered);

            // Fetch Facilities
            if (facilities.length === 0) {
                const facRes = await fetch(`${API_BASE}/facilities`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const facData = await facRes.json();
                setFacilities(facData.facilities || []);
            }

        } catch (err) {
            console.error("Bookings Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStatusUpdate = async (id: number, status: string, message: string) => {
        if (!confirm(message)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/bookings/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert("Action successful!");
                setIsDetailOpen(false);
                loadData();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to update status'}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Filter Logic
    useEffect(() => {
        let result = bookings;

        if (activeFacility !== "all") {
            result = result.filter(b => b.facilityID.toString() === activeFacility);
        }

        if (activeWeek) {
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            result = result.filter(b => {
                const date = new Date(b.date_start || b.date_requested);
                return date >= now && date <= weekFromNow;
            });
        }

        if (activeType !== "all") {
            result = result.filter(b => {
                const status = (b.status || "").toLowerCase();
                if (activeType === "New bookings") return status === "pending";
                if (activeType === "Sign Billing") return status.includes("billing generated");
                return true;
            });
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.user_name || "").toLowerCase().includes(q) ||
                (b.facility_name || "").toLowerCase().includes(q)
            );
        }

        setFilteredBookings(result);
    }, [activeFacility, activeWeek, activeType, searchQuery, bookings]);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading records...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header / Actions Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
                <button
                    onClick={() => setIsBlockModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-700 transition-all border border-gray-700"
                >
                    <Lock size={18} />
                    Block Schedule
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 md:gap-6">

                {/* Top Controls: Search & Main Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                    {/* Search - Full width on mobile */}
                    <div className="w-full md:w-[300px] relative order-1 md:order-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Filter Buttons Group */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto order-2 md:order-1">
                        <button
                            onClick={() => { setActiveFacility("all"); setActiveWeek(false); }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeFacility === "all" && !activeWeek ? "bg-[#1f3c88] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            All Records
                        </button>

                        <select
                            value={activeFacility}
                            onChange={(e) => { setActiveFacility(e.target.value); setActiveWeek(false); }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all border-none outline-none appearance-none cursor-pointer pr-8 bg-no-repeat bg-[right_8px_center] bg-[length:8px] ${activeFacility !== "all" ? "bg-[#1f3c88] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")` }}
                        >
                            <option value="all" className="bg-white text-gray-800">All Facilities</option>
                            {facilities.map(f => (
                                <option key={f.facilityID} value={f.facilityID} className="bg-white text-gray-800">{f.facility_name}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setActiveWeek(!activeWeek)}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeWeek ? "bg-[#1f3c88] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            This Week
                        </button>
                    </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2 pt-4 md:pt-0 border-t border-gray-100 md:border-none">
                    {["all", "New bookings", "Sign Billing"].map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-transparent ${activeType === type ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table View */}
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No records found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => {
                                    const role = (b.user_role || "").toLowerCase();
                                    const isPriority = role.includes("dean") || role.includes("council");
                                    const status = b.status?.toLowerCase() || "";

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
                                        <tr
                                            key={b.bookingID}
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => { setSelectedBooking(b); setIsDetailOpen(true); }}
                                        >
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                                #{b.bookingID}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700">{eventDates}</div>
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
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800 text-sm">{b.user_name}</span>
                                                    {isPriority && (
                                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded">Priority</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{b.organization || "Private Request"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-600">{b.facility_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.includes("reviewed") ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                    {status.split(" - ")[0]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    className="px-4 py-2 bg-[#1f3c88] text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#152a5f] transition-colors shadow-sm whitespace-nowrap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBooking(b);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    {status === 'pending' ? "Sign Request" : "Sign Billing"}
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

            {/* Modals */}
            <PresidentBookingDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                booking={selectedBooking}
                onStatusUpdate={(status, msg) => handleStatusUpdate(selectedBooking.bookingID, status, msg)}
            />

            {/* Block Schedule Modal */}
            <BlockScheduleModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                facilities={facilities}
            />
        </div>
    );
}
