"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    MoreHorizontal,
    FileText,
    CreditCard,
    CheckCircle2
} from "lucide-react";
import BookingDetailModal from "@/components/pm/BookingDetailModal";
import BillingModal from "@/components/pm/BillingModal";
import ViewReceiptModal from "@/components/pm/ViewReceiptModal";
import StatusModal from "@/components/shared/StatusModal";
import { getApiBaseUrl, getBackendUrl } from "@/utils/config";
import Image from "next/image";

// const API_BASE = "http://localhost:5000/api";
const API_BASE = getApiBaseUrl();

export default function PMBookings() {
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
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

    // Status Modal State
    const [statusModalConfig, setStatusModalConfig] = useState<{
        isOpen: boolean;
        status: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    }>({
        isOpen: false,
        status: "success",
        title: "",
        message: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            if (!token || !userData) return;

            const user = JSON.parse(userData);

            // Fetch Bookings
            const res = await fetch(`${API_BASE}/bookings/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const allBookings = data.bookings || [];

            // Filter by Assigned Facilities for PM
            let pmFiltered = allBookings;
            if (user.role_name === "PROJECT MANAGER" && user.assigned_facilities) {
                const allowed = user.assigned_facilities.map(Number);
                pmFiltered = allBookings.filter((b: any) => allowed.includes(Number(b.facilityID)));
            }

            // Initial Filter for Step 3 (President Reviewed), Step 5 (Billing Signed), and Payment Under Review
            const stepFiltered = pmFiltered.filter((b: any) => {
                const s = b.status?.toLowerCase() || '';
                // 'president reviewed - awaiting billing', 'billing signed - awaiting payment', 'payment under review'
                return s.includes('president reviewed') || s.includes('billing signed') || s.includes('payment under review');
            });

            setBookings(stepFiltered);
            setFilteredBookings(stepFiltered);

            // Fetch Facilities for dropdown
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
                setStatusModalConfig({
                    isOpen: true,
                    status: "success",
                    title: "Success",
                    message: "Status updated successfully!"
                });
                loadData();
            }
        } catch (err) {
            console.error(err);
            setStatusModalConfig({
                isOpen: true,
                status: "error",
                title: "Error",
                message: "An error occurred. Please try again."
            });
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
                const purpose = (b.purpose || "").toLowerCase();
                if (activeType === "Evaluation") return purpose.includes("evaluat");
                if (activeType === "Endorsement") return purpose.includes("endors");
                if (activeType === "Booking Request") return !purpose.includes("evaluat") && !purpose.includes("endors");
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

    if (loading) return <div className="p-8 text-center text-gray-400">Loading bookings...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Actions Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
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
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e91e63]/20 focus:border-[#e91e63] transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Filter Buttons Group */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto order-2 md:order-1">
                        <button
                            onClick={() => { setActiveFacility("all"); setActiveWeek(false); }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeFacility === "all" && !activeWeek ? "bg-[#e91e63] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            All Records
                        </button>

                        <select
                            value={activeFacility}
                            onChange={(e) => { setActiveFacility(e.target.value); setActiveWeek(false); }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all border-none outline-none appearance-none cursor-pointer pr-8 bg-no-repeat bg-[right_8px_center] bg-[length:8px] ${activeFacility !== "all" ? "bg-[#e91e63] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")` }}
                        >
                            <option value="all" className="bg-white text-gray-800">Select Facility</option>
                            {facilities.map(f => (
                                <option key={f.facilityID} value={f.facilityID} className="bg-white text-gray-800">{f.facility_name}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setActiveWeek(!activeWeek)}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeWeek ? "bg-[#e91e63] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            This Week
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 md:pt-0 border-t border-gray-100 md:border-none">
                    {["all", "Booking Request", "Evaluation", "Endorsement"].map(type => (
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

            {/* Table Area */}
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Receipt</th>
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
                                    const isPriority = b.user_role_specification?.toLowerCase() === "university account";
                                    const status = b.status?.toLowerCase().replace(/_/g, ' ') || "";

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

                                    // Receipt
                                    const receiptUrl = b.receipt_url;
                                    let isPdf = false;
                                    let fullReceiptUrl = '';
                                    if (receiptUrl) {
                                        isPdf = receiptUrl.toLowerCase().endsWith('.pdf');
                                        fullReceiptUrl = receiptUrl.startsWith('http') ? receiptUrl : `${getBackendUrl()}${receiptUrl.startsWith('/') ? '' : '/'}${receiptUrl}`;
                                    }

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
                                                {receiptUrl ? (
                                                    <div
                                                        className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all relative group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBooking(b);
                                                            setSelectedReceiptUrl(receiptUrl);
                                                            setIsReceiptOpen(true);
                                                        }}
                                                    >
                                                        {isPdf ? (
                                                            <div className="flex flex-col items-center justify-center text-red-500">
                                                                <FileText size={24} />
                                                                <span className="text-[8px] font-bold mt-1 uppercase text-gray-500">PDF</span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={fullReceiptUrl}
                                                                    alt="Preview"
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col">
                                                                    <FileText size={16} className="text-white mb-1" />
                                                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">View</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.includes("reviewed") ? "bg-amber-100 text-amber-700" : (status.includes("payment") ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {status.includes("president reviewed") ? (
                                                    <button
                                                        className="px-4 py-2 bg-[#1f3c88] text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#152a5f] transition-colors shadow-sm whitespace-nowrap"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBooking(b);
                                                            setIsBillingOpen(true);
                                                        }}
                                                    >
                                                        Generate Billing
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            className={`px-4 py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm whitespace-nowrap w-full ${b.receipt_url
                                                                ? "bg-emerald-500 hover:bg-emerald-600"
                                                                : "bg-gray-400 opacity-60 cursor-not-allowed"
                                                                }`}
                                                            disabled={!b.receipt_url}
                                                            title={!b.receipt_url ? "Cannot confirm payment without an uploaded receipt from the client." : "Confirm receipt of payment."}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(b.bookingID, 'approved', 'Confirm receipt of payment? This will finalize the booking.');
                                                            }}
                                                        >
                                                            Confirm Payment
                                                        </button>
                                                    </div>
                                                )}
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
            <BookingDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                booking={selectedBooking}
            />

            <BillingModal
                isOpen={isBillingOpen}
                onClose={() => setIsBillingOpen(false)}
                booking={selectedBooking}
                onSuccess={() => {
                    setStatusModalConfig({
                        isOpen: true,
                        status: "success",
                        title: "Success",
                        message: "Billing sent successfully!"
                    });
                    loadData();
                }}
            />

            <ViewReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                receiptUrl={selectedReceiptUrl}
                bookingId={selectedBooking?.bookingID}
            />

            <StatusModal
                isOpen={statusModalConfig.isOpen}
                onClose={() => setStatusModalConfig(prev => ({ ...prev, isOpen: false }))}
                status={statusModalConfig.status}
                title={statusModalConfig.title}
                message={statusModalConfig.message}
            />
        </div>
    );
}
