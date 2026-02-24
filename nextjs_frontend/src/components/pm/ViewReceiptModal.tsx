"use client";

import React, { useState } from "react";
import { X, FileText, Download, CheckCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { getBackendUrl } from "@/utils/config";

interface ViewReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiptUrl: string | null;
    bookingId: number | null;
}

export default function ViewReceiptModal({ isOpen, onClose, receiptUrl, bookingId }: ViewReceiptModalProps) {
    if (!isOpen || !bookingId || !receiptUrl) return null;

    const isPdf = receiptUrl.toLowerCase().endsWith('.pdf');
    // Ensure the URL is correctly formatted if it's a relative path
    const fullReceiptUrl = receiptUrl.startsWith('http') ? receiptUrl : `${getBackendUrl()}${receiptUrl.startsWith('/') ? '' : '/'}${receiptUrl}`;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold font-heading text-primary flex items-center gap-2">
                            <FileText className="text-primary/80" size={20} />
                            Payment Receipt
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Booking #{bookingId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-gray-100/50 flex-1 overflow-auto flex flex-col items-center justify-center relative min-h-[300px]">
                    {isPdf ? (
                        <div className="text-center w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Document</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This receipt is a PDF document. You can open it in a new tab to view or download it.
                            </p>
                            <a
                                href={fullReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                            >
                                <ExternalLink size={16} /> Open PDF
                            </a>
                        </div>
                    ) : (
                        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                            <a
                                href={fullReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 z-10 p-2 bg-white/90 shadow-sm rounded-full text-gray-700 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                title="Open Full Image"
                            >
                                <ExternalLink size={16} />
                            </a>
                            <Image
                                src={fullReceiptUrl}
                                alt={`Receipt for Booking #${bookingId}`}
                                fill
                                className="object-contain p-2"
                                unoptimized // Useful if images are coming from an external backend URL
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
                    <a
                        href={fullReceiptUrl}
                        download={`receipt_booking_${bookingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> Download
                    </a>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
