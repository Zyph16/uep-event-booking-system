import React, { useEffect, useState } from "react";
import { X, Receipt, Info } from "lucide-react";
import { getApiBaseUrl } from "@/utils/config";
import FTCBillingStatement from "@/components/billing/FTC/FTCBillingStatement";
import ACGBillingStatement from "@/components/billing/ACG/ACGBillingStatement";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number | string | null;
}

export default function BillingModal({ isOpen, onClose, bookingId }: BillingModalProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${getApiBaseUrl()}/bookings/${bookingId}/billing-context`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const billingData = await res.json();
                        setData(billingData);
                    }
                } catch (err) {
                    console.error("Failed to fetch billing details", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, bookingId]);

    if (!isOpen || !bookingId) return null;

    const handlePrint = () => {
        window.print();
    };

    // Prepare data for FTC Template
    const ftcData = data ? {
        customer: data.user_name || "Unknown",
        address: data.user_address || "N/A", // Ensure address is returned by API
        codeNo: data.bookingID ? String(data.bookingID) : "",
        date: data.created_at ? new Date(data.created_at).toLocaleDateString() : "",
        items: [
            { description: `Facility Fee (${data.facility_name})`, unitPrice: data.facility_price || 0, amount: data.facility_price || 0 },
            ...(data.inclusions?.equipment || []).map((e: any) => ({
                description: e.equipment_name,
                unitPrice: e.price,
                amount: e.price
            })),
            ...(data.inclusions?.rooms || []).map((r: any) => ({
                description: r.room_name,
                unitPrice: r.price,
                amount: r.price
            }))
        ],
        total: (data.facility_price || 0) +
            ((data.inclusions?.equipment || []).reduce((a: number, b: any) => a + b.price, 0)) +
            ((data.inclusions?.rooms || []).reduce((a: number, b: any) => a + b.price, 0)),
        preparedBy: data.project_manager || "Unknown",
        issuedBy: "Authorized Officer", // Or data.issued_by if available
        orNo: "",
        dateIssued: ""
    } : null;

    // Prepare data for ACG Template
    const acgData = data ? {
        customer: data.user_name || "Unknown",
        address: data.user_address || "N/A",
        date: data.created_at ? new Date(data.created_at).toLocaleDateString() : "",
        items: [
            { description: `Facility Fee (${data.facility_name})`, unitPrice: data.facility_price || 0, amount: data.facility_price || 0 },
            ...(data.inclusions?.equipment || []).map((e: any) => ({
                description: e.equipment_name,
                unitPrice: e.price,
                amount: e.price
            })),
            ...(data.inclusions?.rooms || []).map((r: any) => ({
                description: r.room_name,
                unitPrice: r.price,
                amount: r.price
            }))
        ],
        total: (data.facility_price || 0) +
            ((data.inclusions?.equipment || []).reduce((a: number, b: any) => a + b.price, 0)) +
            ((data.inclusions?.rooms || []).reduce((a: number, b: any) => a + b.price, 0)),
        preparedBy: "In-Charge",
        approvedBy: "University President"
    } : null;

    const isFTC = data?.billing_template === 'ftc' || data?.billing_template === 'default' || !data?.billing_template;
    const isACG = data?.billing_template === 'acg';

    const equipmentTotal = data?.inclusions?.equipment ? data.inclusions.equipment.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0) : 0;
    const roomsTotal = data?.inclusions?.rooms ? data.inclusions.rooms.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0) : 0;
    const facilityFee = Number(data?.facility_price) || 0;
    const grandTotal = facilityFee + equipmentTotal + roomsTotal;
    const inclusionsTotal = equipmentTotal + roomsTotal;

    // FTC Layout View
    if (isFTC && data && ftcData) {
        return (
            <>
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="bg-white w-full max-w-[900px] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                            <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                                <Receipt size={20} /> Billing Statement (FTC)
                            </h3>
                            <button onClick={onClose} className="hover:text-red-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                            <div className="shadow-lg">
                                <FTCBillingStatement billingData={ftcData} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
                {/* Print Only View */}
                <div className="hidden print:block fixed inset-0 bg-white z-[99999]">
                    <FTCBillingStatement billingData={ftcData} />
                </div>
            </>
        );
    }

    // ACG Layout View
    if (isACG && data && acgData) {
        return (
            <>
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="bg-white w-full max-w-[900px] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                            <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                                <Receipt size={20} /> Billing Statement (ACG)
                            </h3>
                            <button onClick={onClose} className="hover:text-red-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                            <div className="shadow-lg">
                                <ACGBillingStatement billingData={acgData} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
                {/* Print Only View */}
                <div className="hidden print:block fixed inset-0 bg-white z-[99999]">
                    <ACGBillingStatement billingData={acgData} />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 print:hidden">
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
                        {!data && loading && <p className="text-gray-500 text-center">Loading billing details...</p>}
                        {!data && !loading && <p className="text-red-500 text-center">Failed to load billing details.</p>}

                        {data && (
                            <>
                                <p className="mb-5 text-gray-600 text-sm">Please review the billing breakdown below.</p>

                                <div className="bg-blue-50/50 border border-border rounded-lg p-4 mb-5">
                                    {/* Facility */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm font-semibold text-text-main mb-1">
                                            <span>Facility</span>
                                            <span className="font-mono">₱ {facilityFee.toLocaleString()}</span>
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
                                            <span className="font-mono">
                                                ₱ {inclusionsTotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2">
                                            {data.inclusions?.equipment?.map((item: any, idx: number) => (
                                                <div key={`eq-${idx}`} className="flex justify-between text-xs text-text-muted pl-2">
                                                    <span>{item.equipment_name}</span>
                                                    <span>₱ {(Number(item.price) || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {data.inclusions?.rooms?.map((item: any, idx: number) => (
                                                <div key={`rm-${idx}`} className="flex justify-between text-xs text-text-muted pl-2">
                                                    <span>{item.room_name}</span>
                                                    <span>₱ {(Number(item.price) || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-2 border-gray-200 my-4" />

                                    <div className="flex justify-between text-base">
                                        <span className="font-bold text-text-main">Total Due</span>
                                        <span className="font-bold text-primary font-mono">
                                            ₱ {grandTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4 text-xs text-text-muted text-right">
                                    Issued by: <strong>{data.project_manager || 'Authorized Officer'}</strong>
                                </div>

                                <div className="bg-red-50 border border-red-100 rounded-md p-3 flex gap-2 text-red-600 text-xs items-start">
                                    <Info size={16} className="shrink-0 mt-0.5" />
                                    <span>Please screenshot or print this and proceed to the University Cashier to settle payment.</span>
                                </div>
                            </>
                        )}
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
                            disabled={!data}
                        >
                            Print
                        </button>
                    </div>

                </div>
            </div>

            {/* Print Section (Backup/Default) */}
            {/* Note: I'm keeping the hidden print blocks for FTC/ACG in the generic return just in case,
                 but realistically the early returns above handle them. 
                 Wait, if I fall through to here, it means isFTC and isACG are false, so I don't need to render them here.
                 I'll remove the redundant checks from the bottom of the original component if I'm doing early returns.
             */}
        </>
    );
}
