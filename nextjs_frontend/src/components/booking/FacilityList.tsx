"use client";

import React, { useEffect, useState } from "react";
// import Image from "next/image";
import { MapPin, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FacilityListProps {
    facilities: any[];
    loading: boolean;
    error: string;
    selectedId: number | null;
    onSelect: (facility: any) => void;
    renderExpandedDetails?: (facility: any) => React.ReactNode;
}

export default function FacilityList({ facilities, loading, error, selectedId, onSelect, renderExpandedDetails }: FacilityListProps) {

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="text-red-500 p-4 text-center text-sm">{error}</div>;

    if (facilities.length === 0) {
        return <div className="text-gray-500 p-4 text-center">No facilities found.</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {facilities.map((facility) => {
                const isSelected = selectedId === facility.facilityID;
                const isUnavailable = facility.status.toLowerCase() !== "available";

                // Handle image URL
                const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                const imageUrl = facility.imagepath
                    ? (facility.imagepath.startsWith('http')
                        ? facility.imagepath
                        : `http://${hostname}:5000${facility.imagepath.startsWith('/') ? '' : '/'}${facility.imagepath}`)
                    : null;

                return (
                    <div
                        key={facility.facilityID}
                        className={`flex flex-col rounded-xl transition-all duration-500 border-2 overflow-hidden
                            ${isSelected
                                ? `${renderExpandedDetails ? 'border-transparent' : 'border-primary'} bg-blue-50/50 shadow-md transform scale-[1.02]`
                                : "border-transparent bg-white shadow-sm hover:shadow-md hover:bg-gray-50"
                            }
                            ${isUnavailable ? "opacity-75 grayscale-[0.5]" : ""}
                        `}
                    >
                        {/* Summary Section - Collapses when expanded (Mobile), Stays visible (Desktop) */}
                        <div
                            className={`grid transition-all duration-500 ease-in-out ${isSelected && renderExpandedDetails
                                ? 'grid-rows-[0fr] opacity-0 pointer-events-none lg:grid-rows-[1fr] lg:opacity-100 lg:pointer-events-auto'
                                : 'grid-rows-[1fr] opacity-100'
                                }`}
                        >
                            <div
                                onClick={() => onSelect(facility)}
                                className="overflow-hidden min-h-0"
                            >
                                <div className="flex items-center gap-4 p-3 cursor-pointer">
                                    {/* Image */}
                                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={facility.facility_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                                        )}

                                        {isUnavailable && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold text-center p-1">
                                                {facility.status}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-base truncate ${isSelected ? "text-primary" : "text-gray-800"}`}>
                                            {facility.facility_name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} /> {facility.location || 'Campus'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={12} /> {facility.capacity} pax
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                                            {facility.status.toLowerCase() === 'available' ? (
                                                <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Available</span>
                                            ) : (
                                                <span className="text-orange-600 flex items-center gap-1"><AlertCircle size={12} /> {facility.status}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="text-primary pr-2">
                                            <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Inline Expanded Details - Expands when selected */}
                        {renderExpandedDetails && (
                            <div
                                className={`grid transition-all duration-500 ease-in-out ${isSelected
                                        ? 'grid-rows-[1fr] opacity-100 lg:hidden'
                                        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                                    }`}
                            >
                                <div className="overflow-hidden min-h-0">
                                    {renderExpandedDetails(facility)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
