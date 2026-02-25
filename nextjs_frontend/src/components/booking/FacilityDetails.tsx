"use client";

import React, { useRef, useState } from "react";
// import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, Users, Info, Calendar, CheckCircle, AlertCircle, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { getBackendUrl, getDisplayImageUrl } from "@/utils/config";
import AlbumCard from "@/components/cards/albumCards/AlbumCard";

interface FacilityDetailsProps {
    facility: any;
    onBook: () => void;
    variant?: 'default' | 'inline';
    onClose?: () => void;
}

export default function FacilityDetails({ facility, onBook, variant = 'default', onClose }: FacilityDetailsProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const imageCarouselRef = useRef<HTMLDivElement>(null);
    const [selectedAlbumIndex, setSelectedAlbumIndex] = useState<number | null>(null);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const scrollImagesLeft = () => {
        if (imageCarouselRef.current) {
            imageCarouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollImagesRight = () => {
        if (imageCarouselRef.current) {
            imageCarouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

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
    const defaultImageUrl = facility && facility.imagepath
        ? getDisplayImageUrl(facility.imagepath)
        : '';

    const displayImageUrl = selectedPreviewImage || defaultImageUrl;

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

                {displayImageUrl ? (
                    <img
                        key={displayImageUrl} // Force re-render for animation
                        src={displayImageUrl}
                        alt={facility.facility_name}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
                )}

                {/* Desktop Overlay Text */}
                {!isInline && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <h2 className="font-bold text-white mb-2 leading-tight text-2xl sm:text-4xl md:text-5xl lg:text-4xl">{facility.facility_name}</h2>
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

                {/* Album Card Preview (Mapped per folder) */}
                {facility.albums && facility.albums.length > 0 && (
                    <div className="mb-6 animate-in fade-in duration-500 delay-75">

                        {selectedAlbumIndex === null ? (
                            <>
                                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2 uppercase tracking-wider opacity-80">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    Facility Gallery
                                </h3>
                                <div className="relative group">
                                    {/* Left Arrow */}
                                    <button
                                        onClick={scrollLeft}
                                        className="absolute left-0 top-[80px] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {/* Carousel Container */}
                                    <div
                                        ref={carouselRef}
                                        className="flex flex-nowrap overflow-x-auto px-12 gap-4 pb-4 snap-x hide-scrollbar scroll-smooth"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {facility.albums.map((album: any, idx: number) => {
                                            if (!album.images || album.images.length === 0) return null;
                                            return (
                                                <div key={idx} className="w-auto flex-shrink-0 snap-start">
                                                    <AlbumCard
                                                        images={album.images}
                                                        title={album.name}
                                                        onClick={() => setSelectedAlbumIndex(idx)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Right Arrow */}
                                    <button
                                        onClick={scrollRight}
                                        className="absolute right-0 top-[80px] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 uppercase tracking-wider opacity-80">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{facility.albums[selectedAlbumIndex].name}</span>
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedAlbumIndex(null);
                                            setSelectedPreviewImage(null);
                                        }}
                                        className="text-xs font-semibold text-gray-500 hover:text-primary flex items-center gap-1 bg-gray-100 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Back to Albums
                                    </button>
                                </div>
                                <div className="relative group mt-2">
                                    {/* Left Arrow for Images */}
                                    <button
                                        onClick={scrollImagesLeft}
                                        className="absolute left-0 top-[60px] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {/* Image Carousel Container */}
                                    <div
                                        ref={imageCarouselRef}
                                        className="flex flex-nowrap overflow-x-auto px-10 gap-3 pb-2 snap-x hide-scrollbar scroll-smooth"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {facility.albums[selectedAlbumIndex].images.map((img: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="w-[96px] h-[120px] flex-shrink-0 snap-start rounded-[8%] overflow-hidden border-[4px] border-white shadow-sm hover:z-10 relative origin-center animate-spread-in"
                                                style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}
                                            >
                                                <img
                                                    src={getDisplayImageUrl(img.image_path)}
                                                    alt="Facility Image"
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                                                    onClick={() => setSelectedPreviewImage(getDisplayImageUrl(img.image_path))}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Arrow for Images */}
                                    <button
                                        onClick={scrollImagesRight}
                                        className="absolute right-0 top-[60px] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
