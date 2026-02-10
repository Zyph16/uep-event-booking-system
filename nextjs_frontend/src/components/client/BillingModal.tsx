"use client";

import React from "react";
import { X, Receipt, Info } from "lucide-react";

interface BillingItem {
    name: string;
    price: number;
}

interface BillingData {
    facility_fee: number;
    facility_name: string;
    equipment_fee: number;
    inclusions: {
        equipment: BillingItem[];
        rooms: BillingItem[];
    };
}

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number | string | null;
    // In a real app, we might fetch billing details by ID inside here, 
    // or pass the data directly. For now, accepting ID and mocking data internally or via new wrapper.
}

// Mock Function to generate data for visualization
const getMockBilling = (id: any): BillingData => {
    return {
        facility_fee: 5000,
        facility_name: "Gymnasium",
        equipment_fee: 1500,
        inclusions: {
            equipment: [
                { name: "Sound System", price: 1000 },
                { name: "Projector", price: 500 }
            ],
            rooms: []
        }
    };
};

export default function BillingModal({ isOpen, onClose, bookingId }: BillingModalProps) {
    if (!isOpen || !bookingId) return null;

    const data = getMockBilling(bookingId);
    const total = data.facility_fee + data.equipment_fee;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                        <Receipt size={20} /> Billing Details
                    </h3>
                    <button onClick={onClose} className="hover:text-red-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <p className="mb-5 text-gray-600 text-sm">Please review the billing breakdown below.</p>

                    <div className="bg-blue-50/50 border border-border rounded-lg p-4 mb-5">
                        {/* Facility */}
                        <div className="mb-3">
                            <div className="flex justify-between text-sm font-semibold text-text-main mb-1">
                                <span>Facility</span>
                                <span className="font-mono">₱ {data.facility_fee.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-text-muted pl-2">
                                {data.facility_name}
                            </div>
                        </div>

                        <hr className="border-dashed border-gray-300 my-3" />

                        {/* Inclusions */}
                        <div className="mb-3">
                            <div className="flex justify-between text-sm font-semibold text-text-main mb-1">
                                <span>Inclusions</span>
                                <span className="font-mono">₱ {data.equipment_fee.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2">
                                {data.inclusions.equipment.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-text-muted pl-2">
                                        <span>{item.name}</span>
                                        <span>₱ {item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                                {data.inclusions.rooms.map((item, idx) => (
                                    <div key={`rm-${idx}`} className="flex justify-between text-xs text-text-muted pl-2">
                                        <span>{item.name}</span>
                                        <span>₱ {item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-2 border-gray-200 my-4" />

                        <div className="flex justify-between text-base">
                            <span className="font-bold text-text-main">Total Due</span>
                            <span className="font-bold text-primary font-mono">₱ {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mb-4 text-xs text-text-muted text-right">
                        Issued by: <strong>Authorized Officer</strong>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-md p-3 flex gap-2 text-red-600 text-xs items-start">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <span>Please take a screenshot and proceed to the University Cashier to settle payment. Present this reference to the officer.</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-right flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Print
                    </button>
                </div>

            </div>
        </div>
    );
}
