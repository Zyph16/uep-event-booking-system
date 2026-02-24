import React from 'react';
import Image from 'next/image';

interface ACGBillingProps {
    billingData: {
        customer: string;
        address: string;
        date: string;
        items: Array<{
            description: string;
            unitPrice: number;
            amount: number;
        }>;
        total: number;
        preparedBy: string;
        approvedBy: string; // President
    };
}

const ACGBillingStatement: React.FC<ACGBillingProps> = ({ billingData }) => {
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
                    <p className="text-[10px] text-blue-600 underline leading-tight">Web: http://uep.edu.ph; Email: uepnsofficial@gmail.com</p>

                    <div className="mt-3 font-bold uppercase">
                        <h3 className="text-xs">OFFICE OF THE PRESIDENT</h3>
                        <h3 className="text-xs underline decoration-1">UEP GYMNATORIUM</h3>
                    </div>

                    <h1 className="font-bold text-lg mt-3 uppercase underline">ACCOUNT BILL</h1>
                </div>

                {/* Other Logos - Right */}
                <div className="flex gap-2 h-20 items-center">
                    <div className="w-20 h-20 relative flex items-center justify-center bg-gray-50 rounded border border-gray-100 overflow-hidden">
                        <img src="/iso_logo.jpg" alt="ISO" className="h-full w-auto object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80?text=ISO'} />
                    </div>
                    <div className="w-20 h-20 relative flex items-center justify-center bg-gray-50 rounded border border-gray-100 overflow-hidden">
                        <img src="/bagong_pilipinas.jpg" alt="Bagong Pilipinas" className="h-full w-auto object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80?text=BP'} />
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-4 space-y-2">
                <div className="flex">
                    <span className="font-semibold w-24">Customer:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.customer}</span>
                </div>
                <div className="flex">
                    <span className="font-semibold w-24">Address:</span>
                    <span className="border-b border-black flex-1 pl-2">{billingData.address}</span>
                </div>
            </div>

            {/* Table */}
            <div className="border border-black mb-2">
                <div className="grid grid-cols-[1fr_150px_150px] text-center font-bold border-b border-black">
                    <div className="py-2 border-r border-black">Type of Service</div>
                    <div className="py-2 border-r border-black">Unit Price</div>
                    <div className="py-2">Total Amount</div>
                </div>

                {/* Rows */}
                {/* Minimum Rows for layout */}
                {[...Array(8)].map((_, i) => {
                    const item = billingData.items[i];
                    return (
                        <div key={i} className="grid grid-cols-[1fr_150px_150px] border-b border-black/50 min-h-[30px]">
                            <div className="px-2 py-1 border-r border-black flex items-center">
                                {item ? item.description : ''}
                            </div>
                            <div className="px-2 py-1 border-r border-black text-right flex items-center justify-end">
                                {item ? formatCurrency(item.unitPrice) : ''}
                            </div>
                            <div className="px-2 py-1 text-right flex items-center justify-end font-semibold">
                                {item ? (
                                    <div className="flex w-full justify-between">
                                        <span>Php.</span>
                                        <span>{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : ''}
                            </div>
                        </div>
                    );
                })}

                {/* Total Row */}
                <div className="grid grid-cols-[1fr_150px_150px] font-bold border-t border-black bg-gray-50">
                    <div className="py-2 px-4 text-center border-r border-black">Total</div>
                    <div className="border-r border-black bg-gray-200"></div> {/* Empty Unit Price cell for total row */}
                    <div className="py-2 px-2 text-right flex justify-between">
                        <span>Php.</span>
                        <span>{billingData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="flex justify-end mb-12">
                <div className="flex items-end w-1/3">
                    <span className="font-bold mr-2">Date:</span>
                    <span className="border-b border-black flex-1 text-center">{billingData.date}</span>
                </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-12 px-8">
                <div className="text-center">
                    <p className="mb-8 text-left">Prepared by:</p>
                    <div className="border-b border-black w-64 mx-auto mb-1"></div>
                    <p className="font-bold">In-Charge</p>
                </div>

                <div className="text-center">
                    <p className="mb-8 text-left">Approved:</p>
                    <p className="font-bold uppercase border-b border-black px-4">{billingData.approvedBy}</p>
                    <p className="font-bold mt-1">President</p>
                </div>
            </div>
        </div>
    );
};

export default ACGBillingStatement;
