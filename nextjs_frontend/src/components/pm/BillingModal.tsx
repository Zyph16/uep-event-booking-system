"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, CreditCard, Send, Receipt } from "lucide-react";
import { getApiBaseUrl } from "@/utils/config";
import FTCBillingStatement from "@/components/billing/FTC/FTCBillingStatement";
import ACGBillingStatement from "@/components/billing/ACG/ACGBillingStatement";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
}

// const API_BASE = "http://localhost:5000/api";

export default function BillingModal({ isOpen, onClose, booking, onSuccess }: BillingModalProps) {
    const [loading, setLoading] = useState(false);
    const [facilityPrice, setFacilityPrice] = useState(0);
    const [inclusions, setInclusions] = useState<any[]>([]);
    const [totalInclusions, setTotalInclusions] = useState(0);
    const [billingTemplate, setBillingTemplate] = useState("default");
    const [billingContext, setBillingContext] = useState<any>(null);

    useEffect(() => {
        if (isOpen && booking) {
            const fetchPricing = async () => {
                try {
                    const token = localStorage.getItem("token");

                    // Fetch Billing Context (Prices)
                    const res = await fetch(`${getApiBaseUrl()}/bookings/${booking.bookingID}/billing-context`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const data = await res.json();

                    setFacilityPrice(data.facility_price || 0);

                    // Combine equipment and rooms into a single list for the PM view (or keep them separate if needed, but here we flatten for the list)
                    const combinedInclusions = [
                        ...(data.inclusions?.equipment || []).map((e: any) => ({ ...e, name: e.equipment_name, type: 'Equipment' })),
                        ...(data.inclusions?.rooms || []).map((r: any) => ({ ...r, name: r.room_name, type: 'Room' }))
                    ];
                    setInclusions(combinedInclusions);

                    setBillingTemplate(data.billing_template || "default");
                    setBillingContext(data);

                    const inclusionsTotal = combinedInclusions.reduce((acc: number, item: any) => acc + (Number(item.price) || 0), 0);
                    setTotalInclusions(inclusionsTotal);

                } catch (err) {
                    console.error("Pricing Fetch Error:", err);
                }
            };
            fetchPricing();
        }
    }, [isOpen, booking]);

    const handleSendBilling = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${getApiBaseUrl()}/billing`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    booking_id: booking.bookingID,
                    facility_fee: facilityPrice,
                    equipment_fee: totalInclusions
                    // status is handled by backend service now
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Failed to send billing");
            }
        } catch (err) {
            console.error("Billing Error:", err);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    const grandTotal = facilityPrice + totalInclusions;

    const handlePrint = () => {
        window.print();
    };

    // Prepare Data for Templates
    const templateData = billingContext ? {
        customer: billingContext.user_name || "Unknown",
        address: billingContext.user_address || "N/A",
        date: billingContext.created_at ? new Date(billingContext.created_at).toLocaleDateString() : "",
        items: [
            { description: `Facility Fee (${billingContext.facility_name})`, unitPrice: facilityPrice, amount: facilityPrice },
            ...inclusions.map((item: any) => ({
                description: item.name || item.equipment_name || item.room_name,
                unitPrice: Number(item.price),
                amount: Number(item.price)
            }))
        ],
        total: grandTotal,
        preparedBy: billingContext.project_manager || "Project Manager",
        approvedBy: billingContext.university_president || "University President",
        codeNo: booking.bookingID ? String(booking.bookingID) : "",
        dateIssued: "",
        issuedBy: "Authorized Officer"
    } : null;

    const isFTC = billingTemplate === 'ftc' || billingTemplate === 'default' || !billingTemplate;
    const isACG = billingTemplate === 'acg';

    if (isFTC && templateData) {
        return (
            <>
                <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"} print:hidden`}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="bg-white w-full max-w-[900px] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                            <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                                <Receipt size={20} /> Generate Billing (FTC Layout)
                            </h3>
                            <button onClick={onClose} className="hover:text-red-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                            <div className="shadow-lg">
                                <FTCBillingStatement billingData={templateData} />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                Close
                            </button>
                            <button onClick={handlePrint} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                                Print Preview
                            </button>
                            <button onClick={handleSendBilling} disabled={loading} className="px-4 py-2 bg-[#e91e63] text-white font-bold rounded-lg hover:bg-[#c2185b] flex items-center gap-2 transition-colors">
                                {loading ? "Sending..." : <><Send size={16} /> Send Billing</>}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Print Only View */}
                <div className="hidden print:block fixed inset-0 bg-white z-[2000]">
                    <FTCBillingStatement billingData={templateData} />
                </div>
            </>
        );
    }

    if (isACG && templateData) {
        return (
            <>
                <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"} print:hidden`}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="bg-white w-full max-w-[900px] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                            <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                                <Receipt size={20} /> Generate Billing (ACG Layout)
                            </h3>
                            <button onClick={onClose} className="hover:text-red-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                            <div className="shadow-lg">
                                <ACGBillingStatement billingData={templateData} />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                Close
                            </button>
                            <button onClick={handlePrint} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                                Print Preview
                            </button>
                            <button onClick={handleSendBilling} disabled={loading} className="px-4 py-2 bg-[#e91e63] text-white font-bold rounded-lg hover:bg-[#c2185b] flex items-center gap-2 transition-colors">
                                {loading ? "Sending..." : <><Send size={16} /> Send Billing</>}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Print Only View */}
                <div className="hidden print:block fixed inset-0 bg-white z-[2000]">
                    <ACGBillingStatement billingData={templateData} />
                </div>
            </>
        );
    }

    return (
        <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`bg-white w-full max-w-[450px] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"}`}>

                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-br from-[#e91e63] to-[#c2185b] text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard size={22} />
                        Send Billing
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-500 font-medium">Review and confirm the fees for this booking:</p>

                    {/* Facility Section */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <span>Applicant</span>
                            <span className="text-gray-800">{booking.user_name}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Facility</div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">{booking.facility_name}</span>
                                <span className="text-sm font-black text-[#1f3c88]">₱ {facilityPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inclusions Section */}
                    {inclusions.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-2">Inclusions</div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
                                {inclusions.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 font-medium">{item.name}</span>
                                        <span className="font-bold text-gray-800">₱ {(Number(item.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-dashed border-gray-300 flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Inclusions</span>
                                <span className="text-xs font-black text-gray-800">₱ {totalInclusions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-black text-gray-500 uppercase">Grand Total</span>
                        <span className="text-2xl font-black text-[#1f3c88]">₱ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendBilling}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-[#e91e63] text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-200 hover:bg-[#c2185b] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? "Sending..." : (
                            <>
                                <Send size={16} />
                                Send Billing
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
