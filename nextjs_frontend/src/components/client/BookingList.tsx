"use client";

import React, { useState, useEffect } from "react";
import { FileText, Receipt, RefreshCw, Upload } from "lucide-react";
import RequestModal from "./RequestModal";
import BillingModal from "./BillingModal";
import UploadReceiptModal from "./UploadReceiptModal";
import ViewAttachedFilesModal from "./ViewAttachedFilesModal";
import ViewReceiptModal from "../pm/ViewReceiptModal";

import { getApiBaseUrl } from "@/utils/config";

// Mock Data removed
// const MOCK_BOOKINGS = ...

export default function BookingList() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedBookingForUpload, setSelectedBookingForUpload] = useState<number | null>(null);

    // New attached files hub
    const [isAttachedFilesModalOpen, setIsAttachedFilesModalOpen] = useState(false);

    // Receipt Viewer
    const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
    const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false); // Or redirect
                return;
            }

            try {
                const API_BASE = getApiBaseUrl();
                const res = await fetch(`${API_BASE}/bookings/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("tokenExpiry");
                    window.location.href = "/login";
                    return;
                }

                if (!res.ok) throw new Error("Failed to load bookings");
                const data = await res.json();

                // Assuming API returns { bookings: [...] } or just array
                setBookings(data.bookings || (Array.isArray(data) ? data : []));
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const API_BASE = getApiBaseUrl();
            const res = await fetch(`${API_BASE}/bookings/my`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("tokenExpiry");
                window.location.href = "/login";
                return;
            }

            if (!res.ok) throw new Error("Failed to load bookings");
            const data = await res.json();

            setBookings(data.bookings || (Array.isArray(data) ? data : []));
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Format Time
    const formatTime = (t: string) => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayH = hour % 12 || 12;
        return `${displayH}:${m} ${ampm}`;
    };


    // Helper: Generate Dates between start and end (for fallback)
    const getDatesInRange = (startStr: string, endStr: string) => {
        if (!startStr) return [];
        const dates = [];
        const current = new Date(startStr);
        const end = new Date(endStr || startStr);

        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    // Helper: Status Badge Style
    const getStatusBadge = (status: string) => {
        const s = (status || "").toLowerCase().replace("_", " ");

        let styles = "bg-orange-100 text-orange-700";
        let label = s;

        if (s.includes("approved")) {
            styles = "bg-green-100 text-green-700";
        } else if (s.includes("rejected") || s.includes("cancelled")) {
            styles = "bg-red-100 text-red-700";
        } else if (s.includes("awaiting payment") || s.includes("billing ready")) {
            styles = "bg-blue-100 text-blue-700 border border-blue-200";
            label = "Billing Ready";
        } else if (s.includes("reviewed")) {
            label = "Pres. Approval";
        }

        return (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles}`}>
                {label}
            </span>
        );
    };

    // Helper: Check if billing is actionable
    const isActionableBilling = (status: string) => {
        const s = (status || "").toLowerCase().replace(/_/g, " ");
        return s.includes("awaiting payment") || s.includes("billing ready") || s.includes("billing generated");
    };

    const handleViewRequest = (b: any) => {
        setSelectedBooking(b);
        setIsRequestModalOpen(true);
    };

    const handleViewBilling = (b: any) => {
        setSelectedBooking(b);
        setIsBillingModalOpen(true);
    };

    const handleUploadReceipt = (b: any) => {
        setSelectedBookingForUpload(b.bookingID);
        setIsUploadModalOpen(true);
    };

    const handleViewAttachedFiles = (b: any) => {
        setSelectedBooking(b);
        setIsAttachedFilesModalOpen(true);
    };

    const handleViewReceipt = (url: string | null) => {
        setSelectedReceiptUrl(url);
        setIsViewReceiptModalOpen(true);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold w-[120px]">Date</th>
                            <th className="p-4 font-semibold">Facility Name</th>
                            <th className="p-4 font-semibold">Date Requested</th>
                            <th className="p-4 font-semibold">Time</th>
                            <th className="p-4 font-semibold">Purpose</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {currentBookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl mb-2">📅</span>
                                        <p>No bookings found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentBookings.map((b) => (
                                <tr key={b.bookingID} className="hover:bg-gray-50 transition-colors align-top">
                                    {/* Date Created */}
                                    <td className="p-4 whitespace-nowrap text-gray-500">
                                        {new Date(b.created_at).toLocaleDateString()}
                                    </td>

                                    {/* Facility Name */}
                                    <td className="p-4 font-bold text-gray-800">
                                        {b.facility_name}
                                    </td>

                                    {/* Date Requested (List) */}
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            {b.schedule && b.schedule.length > 0 ? (
                                                b.schedule.map((s: any, i: number) => (
                                                    <div key={i} className="h-6 flex items-center whitespace-nowrap">
                                                        {new Date(s.date).toLocaleDateString()}
                                                    </div>
                                                ))
                                            ) : (
                                                // Fallback: Generate list from range
                                                getDatesInRange(b.date_start || b.date_requested, b.date_end).map((d, i) => (
                                                    <div key={i} className="h-6 flex items-center whitespace-nowrap">
                                                        {d.toLocaleDateString()}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </td>

                                    {/* Time (List) */}
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            {b.schedule && b.schedule.length > 0 ? (
                                                b.schedule.map((s: any, i: number) => (
                                                    <div key={i} className="h-6 flex items-center whitespace-nowrap text-gray-600">
                                                        {formatTime(s.time_start)} - {formatTime(s.time_end)}
                                                    </div>
                                                ))
                                            ) : (
                                                // Fallback: Repeat time for each date
                                                getDatesInRange(b.date_start || b.date_requested, b.date_end).map((_, i) => (
                                                    <div key={i} className="h-6 flex items-center whitespace-nowrap text-gray-600">
                                                        {formatTime(b.time_start)} - {formatTime(b.time_end)}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </td>

                                    {/* Purpose */}
                                    <td className="p-4 max-w-[200px]" title={b.purpose}>
                                        <div className="truncate">{b.purpose}</div>
                                    </td>

                                    {/* Status */}
                                    <td className="p-4">
                                        {getStatusBadge(b.status)}
                                    </td>

                                    {/* Action */}
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            {(b.status || "").toLowerCase() === "approved" ? (
                                                <button
                                                    onClick={() => handleViewAttachedFiles(b)}
                                                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm group"
                                                >
                                                    <FileText size={14} className="group-hover:scale-110 transition-transform" /> View Attached Files
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleViewRequest(b)}
                                                        className="flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded text-xs transition-colors shadow-sm"
                                                    >
                                                        <FileText size={14} /> View Request
                                                    </button>

                                                    <button
                                                        onClick={() => handleViewBilling(b)}
                                                        disabled={!b.has_billing && !isActionableBilling(b.status)}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors shadow-sm ${(b.has_billing || isActionableBilling(b.status))
                                                            ? 'bg-primary hover:bg-primary-dark text-white'
                                                            : 'bg-gray-300 text-white cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <Receipt size={14} /> View Billing
                                                    </button>

                                                    {(b.status || "").toLowerCase().includes("billing ready") || (b.status || "").toLowerCase().includes("awaiting payment") || (b.status || "").toLowerCase().includes("billing generated") ? (
                                                        <button
                                                            onClick={() => handleUploadReceipt(b)}
                                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs transition-colors shadow-sm"
                                                        >
                                                            <Upload size={14} /> Upload Receipt
                                                        </button>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
                        <span className="font-medium text-gray-900">{totalPages}</span>
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            <RequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                booking={selectedBooking}
            />

            <BillingModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
                bookingId={selectedBooking?.bookingID}
            />

            <UploadReceiptModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                bookingId={selectedBookingForUpload}
                onUploadSuccess={fetchBookings}
            />

            <ViewAttachedFilesModal
                isOpen={isAttachedFilesModalOpen}
                onClose={() => setIsAttachedFilesModalOpen(false)}
                booking={selectedBooking}
                onViewRequest={() => { setIsAttachedFilesModalOpen(false); handleViewRequest(selectedBooking); }}
                onViewBilling={() => { setIsAttachedFilesModalOpen(false); handleViewBilling(selectedBooking); }}
                onViewReceipt={() => { setIsAttachedFilesModalOpen(false); handleViewReceipt(selectedBooking?.receipt_url); }}
            />

            <ViewReceiptModal
                isOpen={isViewReceiptModalOpen}
                onClose={() => setIsViewReceiptModalOpen(false)}
                receiptUrl={selectedReceiptUrl}
                bookingId={selectedBooking?.bookingID || null}
            />
        </div>
    );
}
