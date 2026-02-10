"use client";

import React, { useRef } from "react";
import { X, Printer } from "lucide-react";

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
}

export default function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (date: string) => {
        if (!date) return "________________";
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className={`bg-white w-full max-w-[900px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"}`}>

                {/* Header (No Print) */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold text-[#1f3c88]">Detailed Report</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#f1f5f9] no-scrollbar">

                    {/* Print Button (No Print) */}
                    <div className="mb-6 flex justify-end no-print">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-[#1f3c88] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#152a5f] transition-all"
                        >
                            <Printer size={18} />
                            Print Report
                        </button>
                    </div>

                    {/* Report Paper */}
                    <div ref={printRef} className="report-paper bg-white w-full mx-auto p-[40px_50px] shadow-sm font-serif text-black leading-relaxed">

                        {/* Letterhead */}
                        <div className="text-center mb-8 relative">
                            <div className="flex justify-center mb-4">
                                {/* Placeholder for Logo (same as legacy) */}
                                <div className="w-16 h-16 border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] italic text-gray-300">LOGO</div>
                            </div>
                            <h5 className="text-[12px] font-normal m-0 tracking-wide uppercase">Republic of the Philippines</h5>
                            <h4 className="text-[16px] font-bold m-1 font-sans">UNIVERSITY OF EASTERN PHILIPPINES</h4>
                            <h5 className="text-[12px] font-normal m-0 font-sans italic">University Town, Northern Samar, Philippines</h5>
                            <p className="text-[11px] mt-1 space-x-2">
                                <span>Web: uep.edu.ph</span>
                                <span>•</span>
                                <span>Email: uep@edu.ph</span>
                            </p>

                            <div className="mt-6 border-t-2 border-black pt-2 font-bold font-sans text-sm uppercase tracking-wider">
                                AUXILIARY SERVICES AND BUSINESS AFFAIRS
                            </div>
                            <div className="mt-1 font-bold font-sans text-xs uppercase">
                                Permission to use Facility
                            </div>
                            <div className="text-right mt-6">
                                Date: <span className="border-b border-black min-w-[150px] inline-block px-2">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Letter Body */}
                        <div className="text-[14px]">
                            <div className="mb-6 space-y-1">
                                <div className="font-bold">President</div>
                                <div>University of Eastern Philippines</div>
                                <div>University Town, Northern Samar</div>
                            </div>

                            <div className="mb-8 pl-10 space-y-1">
                                <div className="flex gap-4 items-baseline">
                                    <span className="font-bold">Thru:</span>
                                    <div className="flex-1">
                                        <div className="font-bold underline decoration-1 underline-offset-4 uppercase">Director</div>
                                        <div className="text-[12px] italic">Auxiliary Services and Business Affairs</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">Ma'am/Sir:</div>

                            <p className="indent-12 mb-4 leading-relaxed">
                                In behalf of the <span className="report-field border-b border-black font-bold px-2 inline-block min-w-[250px] text-center">{booking.organization || "No Organization Listed"}</span> (Organization / Agency)
                            </p>
                            <p className="leading-relaxed">
                                May I request permission to use the <span className="report-field border-b border-black font-bold px-2 inline-block min-w-[200px] text-center">{booking.facility_name || "________________"}</span>
                            </p>
                            <p className="leading-relaxed mt-4">
                                on <span className="report-field border-b border-black font-bold px-2 inline-block min-w-[150px] text-center">{formatDate(booking.date_start)}</span> to <span className="report-field border-b border-black font-bold px-2 inline-block min-w-[150px] text-center">{formatDate(booking.date_end)}</span>
                            </p>
                            <p className="leading-relaxed mt-4">
                                for the purpose of <span className="report-field border-b border-black font-bold px-2 inline-block min-w-[300px] text-center">{booking.purpose || "________________"}</span>
                            </p>

                            {/* Signatures */}
                            <div className="mt-16 grid grid-cols-2 gap-y-12 gap-x-12">
                                <div className="text-center">
                                    <div className="border-t border-black pt-1 px-4 inline-block min-w-[200px]">
                                        <div className="font-bold uppercase">{booking.user_name}</div>
                                        <div className="text-[10px] mt-1 italic">Applicant / Requested By</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-black pt-1 px-4 inline-block min-w-[200px]">
                                        <div className="font-bold opacity-0">________________</div>
                                        <div className="text-[10px] mt-1 italic">Dean / Office Head</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-black pt-1 px-4 inline-block min-w-[200px]">
                                        <div className="font-bold opacity-0">________________</div>
                                        <div className="text-[10px] mt-1 italic">Director, Auxiliary Services</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-black pt-1 px-4 inline-block min-w-[200px]">
                                        <div className="font-bold opacity-0">________________</div>
                                        <div className="text-[10px] mt-1 italic">University President</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-20 border-t border-gray-200 pt-4 flex justify-between items-center text-[10px] text-gray-500 font-sans">
                            <div className="border border-gray-300 p-2 font-bold">
                                ISO 9001:2015 REGISTERED
                            </div>
                            <div className="text-center">
                                <div>UEP-AF-ASBA-01</div>
                                <div>Revision: 01</div>
                            </div>
                            <div className="text-right">
                                <div>Effective Date: May 2023</div>
                                <div className="font-bold">BAGONG PILIPINAS</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer (No Print) */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 no-print bg-white">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                        Close
                    </button>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .report-paper, .report-paper * {
                        visibility: visible;
                    }
                    .report-paper {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
}
