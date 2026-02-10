"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import FacilityList from "@/components/booking/FacilityList";
import FacilityDetails from "@/components/booking/FacilityDetails";
import BookingModal from "@/components/booking/BookingModal";

export default function BookingPage() {
    const [selectedFacility, setSelectedFacility] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch Facilities
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch("http://192.168.1.31:5000/api/facilities/public");
                if (!res.ok) throw new Error("Failed to load facilities");
                const data = await res.json();
                setFacilities(data.facilities || []);
            } catch (err) {
                console.error(err);
                setError("Unable to load facilities.");
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    // Filter Facilities
    const filteredFacilities = facilities.filter(facility =>
        facility.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (facility.location && facility.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleBookClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)]">

            {/* Header */}
            <div className="mb-8 bg-gradient-to-br from-[#1f3c88] to-[#0d2b6b] p-8 rounded-2xl text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-4">Find Your Perfect Facility</h1>
                <div className="relative max-w-2xl">
                    <input
                        type="text"
                        placeholder="Search facility name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 outline-none transition-all shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#e91e63] p-2 rounded-lg cursor-pointer hover:bg-[#c2185b] transition-colors shadow-md">
                        <Search className="text-white" size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-250px)] lg:min-h-[600px]">

                {/* Left Panel: Facility List */}
                <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Facilities</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filteredFacilities.length} Available</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <FacilityList
                            facilities={filteredFacilities}
                            loading={loading}
                            error={error}
                            selectedId={selectedFacility?.facilityID || null}
                            onSelect={setSelectedFacility}
                            renderExpandedDetails={(facility) => (
                                <div className="lg:hidden">
                                    <FacilityDetails
                                        facility={facility}
                                        onBook={handleBookClick}
                                        variant="inline"
                                        onClose={() => setSelectedFacility(null)}
                                    />
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Right Panel: Details (Desktop Only) */}
                <div className="hidden lg:block lg:col-span-8 h-full">
                    <FacilityDetails
                        facility={selectedFacility}
                        onBook={handleBookClick}
                        variant="default"
                    />
                </div>

            </div>

            {/* Booking Modal Overlay */}
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                facility={selectedFacility}
            />

        </div>
    );
}
