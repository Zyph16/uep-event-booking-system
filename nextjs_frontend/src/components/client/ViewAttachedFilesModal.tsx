"use client";

import React from "react";
import { X, FileText, Receipt, Image as ImageIcon } from "lucide-react";

interface ViewAttachedFilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onViewRequest: () => void;
    onViewBilling: () => void;
    onViewReceipt: () => void;
}

export default function ViewAttachedFilesModal({
    isOpen,
    onClose,
    booking,
    onViewRequest,
    onViewBilling,
    onViewReceipt
}: ViewAttachedFilesModalProps) {
    if (!isOpen || !booking) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                            <FileText size={20} className="text-primary/80" />
                            Attached Files
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Booking #{booking.bookingID}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body / Action Buttons */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-6">
                        This booking has been approved. You can view the following documents associated with this event:
                    </p>

                    <button
                        onClick={onViewRequest}
                        className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-left group"
                    >
                        <div className="p-3 bg-teal-100 text-teal-700 rounded-lg group-hover:bg-teal-200 transition-colors">
                            <FileText size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-800">Request Form</span>
                            <span className="text-xs text-gray-500">View your original booking details and inclusions</span>
                        </div>
                    </button>

                    <button
                        onClick={onViewBilling}
                        className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-left group"
                    >
                        <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-800">Billing Statement</span>
                            <span className="text-xs text-gray-500">View your generated price breakdowns</span>
                        </div>
                    </button>

                    <button
                        onClick={onViewReceipt}
                        disabled={!booking.receipt_url}
                        className={`w-full flex items-center gap-3 p-4 border rounded-xl transition-colors text-left group
                            ${booking.receipt_url
                                ? 'border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                                : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}
                    >
                        <div className={`p-3 rounded-lg transition-colors
                            ${booking.receipt_url ? 'bg-orange-100 text-orange-700 group-hover:bg-orange-200' : 'bg-gray-200 text-gray-500'}`}
                        >
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-800">Uploaded Receipt</span>
                            <span className="text-xs text-gray-500">
                                {booking.receipt_url ? "View your submitted proof of payment" : "No receipt attached"}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
