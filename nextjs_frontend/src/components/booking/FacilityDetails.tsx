"use client";

import React from "react";
// import Image from "next/image";
import { Users, MapPin, CheckCircle, AlertCircle, Info, Calendar, Package, ArrowLeft } from "lucide-react";

interface FacilityDetailsProps {
    facility: any;
    onBook: () => void;
    variant?: 'default' | 'inline';
    onClose?: () => void;
}

export default function FacilityDetails({ facility, onBook, variant = 'default', onClose }: FacilityDetailsProps) {
    if (!facility) {
        if (variant === 'inline') return null; // Don't show empty state inline
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-1.5 h-1.5 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Info size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Facility Selected</h3>
                <p className="text-gray-500 max-w-sm">Select a facility from the list on the left to view details and check availability.</p>
            </div>
        );
    }

    // Handle image URL
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const imageUrl = facility.imagepath
        ? (facility.imagepath.startsWith('http')
            ? facility.imagepath
            : `http://${hostname}:5000${facility.imagepath.startsWith('/') ? '' : '/'}${facility.imagepath}`)
        : null;

    const isAvailable = facility.status.toLowerCase() === "available";
    const isInline = variant === 'inline';

    return (
        <div className={`flex flex-col overflow-hidden 
            ${isInline
                ? 'h-auto bg-transparent w-full'
                : 'h-full bg-white rounded-2xl shadow-sm border border-gray-100'
            }`}>
            {/* Hero Image */}
            <div className={`relative w-full bg-gray-200 ${isInline ? 'h-52' : 'h-64 md:h-80'}`}>
                {/* Back Button (Inline Only) */}
                {isInline && onClose && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 left-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}

                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={facility.facility_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
                )}

                {/* Desktop Overlay Text */}
                {!isInline && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <h2 className="font-bold text-white mb-2 leading-tight text-3xl">{facility.facility_name}</h2>
                        <div className="flex items-center gap-3 text-white/90 text-sm font-medium flex-wrap">
                            <span className="flex items-center gap-1.5 backdrop-blur-sm bg-white/20 px-3 py-1 rounded-full border border-white/10">
                                <MapPin size={14} /> {facility.location || 'Campus'}
                            </span>
                            <span className="flex items-center gap-1.5 backdrop-blur-sm bg-white/20 px-3 py-1 rounded-full border border-white/10">
                                <Users size={14} /> {facility.capacity} pax
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className={`flex-1 ${isInline ? 'p-4' : 'p-6 md:p-8'} ${isInline ? '' : 'overflow-y-auto'}`}>

                {/* Mobile/Inline Header (Below Image) */}
                {isInline && (
                    <div className="mb-5 animate-in slide-in-from-bottom-2 duration-300 flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{facility.facility_name}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-600">
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={16} className="text-primary/70" />
                                    {facility.location || 'Campus'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={16} className="text-primary/70" />
                                    {facility.capacity} pax
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBook();
                            }}
                            disabled={!isAvailable}
                            className={`shrink-0 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap
                                ${isAvailable
                                    ? "bg-primary text-white hover:bg-primary/90 active:scale-95"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                            `}
                        >
                            <Calendar size={16} />
                            {isAvailable ? "Book" : "Full"}
                        </button>
                    </div>
                )}

                {/* Status & Action */}
                <div className={`flex justify-between items-center mb-4 pb-4 border-b border-gray-100 ${isInline ? 'flex-col gap-4 items-stretch' : ''}`}>
                    <div className="flex items-center gap-3 justify-between">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isAvailable ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {facility.status}
                        </div>
                        {facility.price && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-700">
                                PHP {facility.price}
                            </div>
                        )}
                    </div>

                    {/* Desktop Book Button */}
                    {!isInline && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBook();
                            }}
                            disabled={!isAvailable}
                            className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center justify-center gap-2
                  ${isAvailable
                                    ? "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-xl"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                `}
                        >
                            <Calendar size={18} />
                            {isAvailable ? "Book This Facility" : "Unavailable"}
                        </button>
                    )}
                </div>

                {/* Inclusions (Equipment & Rooms) */}
                {(facility.equipment_included?.length > 0 || facility.rooms_included?.length > 0) && (
                    <div className="mb-6 animate-in fade-in duration-500 delay-100">
                        <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2 uppercase tracking-wider opacity-80">
                            <Package size={16} className="text-primary" />
                            Inclusions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {/* Rooms */}
                            {facility.rooms_included?.map((roomName: string, idx: number) => (
                                <span key={`rm-${idx}`} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    {roomName}
                                </span>
                            ))}
                            {/* Equipment */}
                            {facility.equipment_included?.map((itemName: string, idx: number) => (
                                <span key={`eq-${idx}`} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {itemName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description if available (placeholder) */}
                {facility.description && (
                    <div className="text-gray-600 text-sm leading-relaxed">
                        {facility.description}
                    </div>
                )}
            </div>
        </div >
    );
}
