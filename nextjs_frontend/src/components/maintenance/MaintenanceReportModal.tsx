"use client";

import React from "react";
import Image from "next/image";
import { X, Printer } from "lucide-react";

interface Booking {
    bookingID: number | string;
    user_name: string;
    user_phone?: string;
    facility_name: string;
    organization: string;
    purpose: string;
    date_start: string;
    date_end: string;
    time_start: string;
    time_end: string;
    setup_date_start: string | null;
    setup_date_end: string | null;
    setup_time_start: string | null;
    setup_time_end: string | null;
    status: string;
    equipment_inclusions: string[];
    room_inclusions: string[];
}

interface MaintenanceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export default function MaintenanceReportModal({ isOpen, onClose, booking }: MaintenanceReportModalProps) {
    if (!isOpen || !booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeInfo: string) => {
        if (!timeInfo) return "";
        const [h, m] = timeInfo.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayH = hour % 12 || 12;
        return `${displayH}:${m} ${ampm}`;
    };

    const items = [
        "Gymnasium",
        "Hostel",
        "Swimming Pool",
        "Grandstand",
        "Function Hall",
        "Audio Visual Room",
        "Tari-an",
        "Others",
    ];

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-white print:static print:block">
            {/* Modal Content - mimics "report-paper" */}
            <div className="bg-white w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-12 print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible print:rounded-none relative">

                {/* Actions (Hidden on Print) */}
                <div className="flex justify-end gap-2 mb-4 print:hidden sticky top-0 right-0 z-10">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        <X size={16} /> Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        <Printer size={16} /> Print
                    </button>
                </div>

                {/* Report Header */}
                <div className="text-center mb-8 relative border-b-2 border-black pb-4">
                    <div className="flex justify-between items-center px-4 mb-4">
                        <div className="w-[80px]">
                            <div className=" w-[80px] h-[80px]  flex items-center justify-center text-xs text-gray-400">
                                <Image
                                    src="/images/uep_logo.png"
                                    alt="UEP Logo"
                                    width={80}
                                    height={80}
                                    className="object-contain h-20 w-auto"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-center font-sans">
                            <h5 className="text-[12px] font-normal m-0">Republic of the Philippines</h5>
                            <h4 className="text-[16px] font-bold m-1">UNIVERSITY OF EASTERN PHILIPPINES</h4>
                            <h5 className="text-[12px] font-normal m-0">University Town, Northern Samar</h5>
                            <p className="text-[11px] mt-1">Web: uep.edu.ph &nbsp;&nbsp; Email: uep@edu.ph</p>
                        </div>
                        <div className="flex gap-2 w-[170px] justify-end">
                            <div className="w-[80px] h-[80px] flex items-center justify-center text-xs text-gray-400">
                                <Image
                                    src="/images/socotec.png"
                                    alt="UEP Logo"
                                    width={80}
                                    height={80}
                                    className="object-contain h-20 w-auto"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <div className="w-[80px] h-[80px]  flex items-center justify-center text-xs text-gray-400">
                                <Image
                                    src="/images/Bagong_Pilipinas_logo.png"
                                    alt="UEP Logo"
                                    width={80}
                                    height={80}
                                    className="object-contain h-20 w-auto"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="font-bold border-t-2 border-black pt-2 font-sans text-sm">
                        AUXILIARY SERVICES AND BUSINESS AFFAIRS
                    </div>
                    <div className="font-bold font-sans text-sm">
                        Permission to use Facility
                    </div>
                    <div className="text-right text-sm mt-4">
                        Date: <span className="border-b border-black min-w-[100px] inline-block text-center">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="text-[14px] leading-relaxed font-serif text-black space-y-6">
                    <div>
                        <div>President</div>
                        <div>University of Eastern Philippines</div>
                        <div>University Town, Northern Samar</div>
                    </div>

                    <div className="pl-10">
                        <div>Thru: &nbsp;&nbsp; <strong>Director</strong></div>
                        <div className="pl-10">Auxiliary Services and Business Affairs</div>
                    </div>

                    <div>Ma&apos;am/Sir:</div>

                    <p className="indent-10">
                        In behalf of the <span className="font-bold underline px-2">{booking.organization || "____________"}</span> (Organization / Agency)
                    </p>

                    <p>
                        May I request permission to use the <span className="font-bold underline px-2">{booking.facility_name}</span> on{" "}
                        <span className="font-bold underline px-2">{formatDate(booking.date_start)} {booking.date_end && booking.date_end !== booking.date_start ? `to ${formatDate(booking.date_end)}` : ""}</span> at{" "}
                        <span className="font-bold underline px-2">
                            {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
                        </span>{" "}
                        for <span className="font-bold underline px-2">{booking.purpose}</span>.
                    </p>

                    <p>We shall abide with the University rules and regulations hereto attached.</p>
                    <p>Thank you.</p>

                    <div className="flex flex-col items-end mt-12 pr-12">
                        <div className="text-center min-w-[200px]">
                            <div className="mb-8">Very truly yours,</div>
                            <div className="font-bold uppercase mb-1">{booking.user_name}</div>
                            <div className="border-t border-black pt-1 px-4 text-xs">Signature over Printed Name</div>
                        </div>
                    </div>
                </div>

                {/* Checklist */}
                <div className="mt-8 text-[14px]">
                    <div className="font-bold italic mb-2">Service/Facilities requested: (please check applicable box/items)</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-4 mb-4">
                        {items.map((item) => {
                            const isChecked =
                                (item === 'Others' && !items.slice(0, 7).some(i => booking.facility_name.includes(i))) ||
                                booking.facility_name.includes(item);

                            return (
                                <div key={item} className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-black flex items-center justify-center text-xs">
                                        {isChecked ? "✓" : ""}
                                    </div>
                                    <span>{item}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        Others (specify): <span className="border-b border-black min-w-[200px] inline-block px-2 mt-2">
                            {[...(booking.equipment_inclusions || []), ...(booking.room_inclusions || [])].join(", ")}
                        </span>
                    </div>
                </div>

                {/* Setup Time Additional Info for Maintenance */}
                {booking.setup_date_start && (
                    <div className="mt-6 border border-black p-4 text-sm font-sans mb-8">
                        <div className="font-bold mb-1">Maintenance Setup Schedule:</div>
                        <div>Dates: {formatDate(booking.setup_date_start)} {booking.setup_date_end && booking.setup_date_end !== booking.setup_date_start ? `- ${formatDate(booking.setup_date_end)}` : ''}</div>
                        <div>Time: {formatTime(booking.setup_time_start || '')} - {formatTime(booking.setup_time_end || '')}</div>
                    </div>
                )}

                {/* Signatures */}
                <div className="flex justify-between mt-12 gap-8 text-[14px] font-serif items-end">
                    <div className="text-center min-w-[200px]">
                        <div className="mb-8 font-sans text-left pl-2">Recommending Approval:</div>
                        <div className="font-bold uppercase border-b border-black pb-1 mb-1 relative h-6"></div>
                        <div className="text-xs">In-charge</div>
                    </div>

                    <div className="text-center min-w-[200px]">
                        <div className="mb-8 font-sans text-left pl-2">Noted:</div>
                        <div className="font-bold uppercase border-b border-black pb-1 mb-1 h-6"></div>
                        <div className="text-xs">Director, ASBA</div>
                    </div>
                </div>

                <div className="text-center mt-12 text-[14px] font-serif">
                    <div className="mb-8 font-sans text-left pl-12 max-w-[200px] mx-auto">Approved:</div>
                    <div className="relative inline-block min-w-[250px] text-center">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[180px] pointer-events-none opacity-80 mix-blend-multiply text-blue-900 font-script text-3xl">
                            {/* Placeholder for Signature Image */}
                            [Signature]
                        </div>
                        <div className="font-bold uppercase border-b border-black pb-1 mb-1 z-10 relative">
                            CHERRY I. ULTRA, PhD.
                        </div>
                        <div className="text-xs">President</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-2 border-t border-gray-300 flex justify-between text-[10px] font-sans text-gray-600">
                    <div className="border border-gray-400 p-2 text-center leading-tight">DOCUMENT NO.:<br />UEP-ASBA-FM-020</div>
                    <div className="border border-gray-400 p-2 text-center leading-tight">REVISION NO.:<br />00</div>
                    <div className="border border-gray-400 p-2 text-center leading-tight">EFFECTIVITY DATE:<br />September 12, 2022</div>
                </div>

            </div>
        </div>
    );
}
