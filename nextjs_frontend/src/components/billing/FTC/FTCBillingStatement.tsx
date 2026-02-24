import React from 'react';
import Image from 'next/image';

interface FTCBillingProps {
    billingData: {
        customer: string;
        address: string;
        codeNo?: string;
        date: string;
        items: Array<{
            description: string;
            unitPrice: number;
            amount: number;
        }>;
        total: number;
        preparedBy: string;
        issuedBy?: string;
        orNo?: string;
        dateIssued?: string;
    };
}

const FTCBillingStatement: React.FC<FTCBillingProps> = ({ billingData }) => {
    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    return (
        <div className="bg-white p-8 max-w-[800px] mx-auto text-black font-serif text-sm print:p-0 print:max-w-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                {/* UEP Logo - Left */}
                <div className="w-20 h-20 relative">
                    <Image
                        src="/images/uep_logo.png"
                        alt="UEP Logo"
                        width={80}
                        height={80}
                        className="object-contain h-20 w-auto"
                    />
                </div>

                {/* Header Text - Center */}
                <div className="text-center flex-1 px-4">
                    <p className="text-[10px] leading-tight">Republic of the Philippines</p>
                    <h2 className="font-bold text-base leading-tight">UNIVERSITY OF EASTERN PHILIPPINES</h2>
                    <p className="text-[10px] leading-tight">University Town, Northern Samar, Philippines</p>
                    <p className="text-[10px] text-blue-600 underline leading-tight">Web: uep.edu.ph; Email: uepnsofficial@gmail.com</p>

                    <div className="mt-3 font-bold uppercase">
                        <h3 className="text-xs">AUXILIARY SERVICES AND BUSINESS AFFAIRS</h3>
                        <h3 className="text-xs underline decoration-1">FARMER'S TRAINING CENTER</h3>
                    </div>

                    <h1 className="font-bold text-lg mt-3 uppercase">BILLING STATEMENT</h1>
                </div>

                {/* Other Logos - Right */}
                <div className="flex gap-2 h-20 items-center">
                    <div className="w-20 h-20 relative flex items-center justify-center bg-gray-50 rounded border border-gray-100 overflow-hidden">
                        <img src="/images/socotec.png" alt="ISO" className="h-full w-auto object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80?text=ISO'} />
                    </div>
                    <div className="w-20 h-20 relative flex items-center justify-center bg-gray-50 rounded border border-gray-100 overflow-hidden">
                        <img src="/images/Bagong_Pilipinas_logo.png" alt="Bagong Pilipinas" className="h-full w-auto object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80?text=BP'} />
                    </div>
                    <div className="border border-black px-1 py-0.5 self-start text-[8px] absolute top-8 right-8 print:right-0">
                        IGP Form No. 5
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div className="flex">
                    <span className="font-semibold w-24">Customer:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.customer}</span>
                </div>
                <div className="flex">
                    <span className="font-semibold w-20">Code No:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.codeNo || ''}</span>
                </div>
                <div className="flex">
                    <span className="font-semibold w-24">Address:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.address}</span>
                </div>
                <div className="flex">
                    <span className="font-semibold w-20">Date:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.date}</span>
                </div>
            </div>

            {/* Table */}
            <div className="border border-black mb-2">
                <div className="grid grid-cols-[1fr_100px_100px] text-center font-bold border-b border-black bg-gray-50">
                    <div className="py-2 border-r border-black">Type of Service</div>
                    <div className="py-2 border-r border-black">Unit Price</div>
                    <div className="py-2">Amount</div>
                </div>

                {/* Rows */}
                {/* Minimum Rows for layout */}
                {[...Array(5)].map((_, i) => {
                    const item = billingData.items[i];
                    return (
                        <div key={i} className="grid grid-cols-[1fr_100px_100px] border-b border-black/50 min-h-[30px]">
                            <div className="px-2 py-1 border-r border-black flex items-center">
                                {item ? item.description : ''}
                            </div>
                            <div className="px-2 py-1 border-r border-black text-right flex items-center justify-end">
                                {item ? formatCurrency(item.unitPrice) : ''}
                            </div>
                            <div className="px-2 py-1 text-right flex items-center justify-end font-semibold">
                                {item ? (
                                    <div className="flex w-full justify-between">
                                        <span>P</span>
                                        <span>{item.amount.toFixed(2)}</span>
                                    </div>
                                ) : ''}
                            </div>
                        </div>
                    );
                })}

                {/* Total Row */}
                <div className="grid grid-cols-[1fr_100px_100px] font-bold border-t border-black bg-gray-50">
                    <div className="py-2 px-4 text-right border-r border-black col-span-2">TOTAL:</div>
                    <div className="py-2 px-2 text-right flex justify-between">
                        <span>P</span>
                        <span>{billingData.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-center italic mb-6">(This serves as collection or demand letter)</p>

            {/* Footer / Signatures */}
            <div className="flex gap-4">
                {/* Left Side: Prepared/Received */}
                <div className="flex-1 flex flex-col gap-8">
                    <div>
                        <p className="mb-8">Prepared by:</p>
                        <div className="w-[80%] mx-auto text-center">
                            <p className="font-bold uppercase border-b border-black px-4">{billingData.preparedBy}</p>
                            <p className="text-xs">FTC Manager</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-end">
                            <span className="mr-2">Received by:</span>
                            <div className="flex-1 border-b border-black text-center">
                                <span className="text-xs block mt-4">Customer/Client</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: OR Info Box */}
                <div className="w-[250px] border border-black p-2">
                    <div className="flex items-end mb-2">
                        <span className="w-20 text-sm">OR No.</span>
                        <div className="flex-1 border-b border-black pl-2 h-5 text-sm">{billingData.orNo || ''}</div>
                    </div>
                    <div className="flex items-end mb-2">
                        <span className="w-20 text-sm">Issued by:</span>
                        <div className="flex-1 border-b border-black pl-2 h-5 text-sm">{billingData.issuedBy || ''}</div>
                    </div>
                    <div className="flex items-end">
                        <span className="w-20 text-sm">Date Issued:</span>
                        <div className="flex-1 border-b border-black pl-2 h-5 text-sm">{billingData.dateIssued || ''}</div>
                    </div>
                </div>
            </div>

            {/* Document Metadata Footer */}
            <div className="mt-8 pt-2 border-t border-black/20 flex justify-between text-[10px] items-center">
                <div className="flex gap-2">
                    <span className="font-bold">DOCUMENT NO.:</span>
                    <span>UEP-ASBA-FM-014</span>
                </div>
                <div className="flex gap-2 border-l border-black/20 pl-4">
                    <span className="font-bold">REVISION NO.:</span>
                    <span>00</span>
                </div>
                <div className="flex gap-2 border-l border-black/20 pl-4">
                    <span className="font-bold">EFFECTIVITY DATE:</span>
                    <span>September 12, 2022</span>
                </div>
            </div>
        </div>
    );
};

export default FTCBillingStatement;
