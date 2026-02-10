"use client";

import React, { useState, useEffect } from "react";
import { FileText, Receipt, RefreshCw } from "lucide-react";
import RequestModal from "./RequestModal";
import BillingModal from "./BillingModal";

// Mock Data Source for verification
const MOCK_BOOKINGS = [
    {
        bookingID: 101,
        date_requested: "2023-10-01 08:00:00",
        facility_name: "Gymnasium",
        date_start: "2023-10-15",
        time_start: "08:00:00",
        time_end: "17:00:00",
        purpose: "Inter-College Basketball Tournament",
        status: "approved",
        organization: "Sports Club",
        client_name: "John Doe",
        project_manager: "Engr. Manager",
        university_president: "CHERRY I. ULTRA, PhD.",
        has_billing: true
    },
    {
        bookingID: 102,
        date_requested: "2023-10-05 09:30:00",
        facility_name: "Audio Visual Room",
        date_start: "2023-10-20",
        time_start: "13:00:00",
        time_end: "15:00:00",
        purpose: "Film Viewing Activity",
        status: "pending",
        organization: "Arts Council",
        client_name: "John Doe",
        project_manager: "Engr. Manager",
        has_billing: false
    },
    {
        bookingID: 103,
        date_requested: "2023-10-06 14:00:00",
        facility_name: "Function Hall",
        date_start: "2023-10-25",
        time_start: "18:00:00",
        time_end: "22:00:00",
        purpose: "Alumni Homecoming Dinner",
        status: "awaiting_payment",
        organization: "Alumni Assoc.",
        client_name: "John Doe",
        project_manager: "Engr. Manager",
        university_president: "CHERRY I. ULTRA, PhD.",
        has_billing: true
    }
];

export default function BookingList() {
    const [bookings, setBookings] = useState<any[]>(MOCK_BOOKINGS);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

    // Helper: Format Time
    const formatTime = (t: string) => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayH = hour % 12 || 12;
        return `${displayH}:${m} ${ampm}`;
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

    const handleViewRequest = (b: any) => {
        setSelectedBooking(b);
        setIsRequestModalOpen(true);
    };

    const handleViewBilling = (b: any) => {
        setSelectedBooking(b);
        setIsBillingModalOpen(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Request Date</th>
                            <th className="p-4 font-semibold">Facility</th>
                            <th className="p-4 font-semibold">Event Date</th>
                            <th className="p-4 font-semibold">Time</th>
                            <th className="p-4 font-semibold">Purpose</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl mb-2">📅</span>
                                        <p>No bookings found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            bookings.map((b) => (
                                <tr key={b.bookingID} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        {new Date(b.date_requested).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-medium">{b.facility_name}</td>
                                    <td className="p-4">
                                        {new Date(b.date_start).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {formatTime(b.time_start)} - {formatTime(b.time_end)}
                                    </td>
                                    <td className="p-4 max-w-[200px] truncate" title={b.purpose}>
                                        {b.purpose}
                                    </td>
                                    <td className="p-4">{getStatusBadge(b.status)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleViewRequest(b)}
                                                className="flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded text-xs transition-colors shadow-sm"
                                            >
                                                <FileText size={14} /> View Request
                                            </button>

                                            <button
                                                onClick={() => handleViewBilling(b)}
                                                disabled={!b.has_billing && b.status !== 'awaiting_payment'}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors shadow-sm ${(b.has_billing || b.status === 'awaiting_payment')
                                                        ? 'bg-primary hover:bg-primary-dark text-white'
                                                        : 'bg-gray-300 text-white cursor-not-allowed'
                                                    }`}
                                            >
                                                <Receipt size={14} /> View Billing
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
        </div>
    );
}
