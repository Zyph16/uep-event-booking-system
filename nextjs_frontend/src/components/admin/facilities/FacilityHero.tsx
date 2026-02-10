import React from "react";
import { MapPin, Users, Image as ImageIcon } from "lucide-react";

interface FacilityHeroProps {
    facility: any;
}

export default function FacilityHero({ facility }: FacilityHeroProps) {
    if (!facility) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <p>Select a facility from the list below to view details.</p>
            </div>
        );
    }

    const isAvailable = facility.status === 'available';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {facility.imagepath ? (
                    <img
                        src={facility.imagepath.startsWith('http') ? facility.imagepath : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000${facility.imagepath}`}
                        alt={facility.facility_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon size={48} />
                        <span className="text-sm mt-2">No Image</span>
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-[#1f3c88]">{facility.facility_name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {facility.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={18} className="text-[#1f3c88]" />
                        <span>{facility.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} className="text-[#1f3c88]" />
                        <span>{facility.capacity} Capacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span>PHP {facility.price}</span>
                    </div>
                </div>

                {/* Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto pt-6 border-t border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wider">Equipment Included</h3>
                        <div className="max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                            {(facility.equipment_names || facility.equipment_included) && (facility.equipment_names || facility.equipment_included).length > 0 ? (
                                <ul className="space-y-1">
                                    {(facility.equipment_names || facility.equipment_included).map((item: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="text-[#1f3c88] mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-sm text-gray-400 italic">None</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wider">Rooms Included</h3>
                        <div className="max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                            {(facility.room_names || facility.rooms_included) && (facility.room_names || facility.rooms_included).length > 0 ? (
                                <ul className="space-y-1">
                                    {(facility.room_names || facility.rooms_included).map((item: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="text-[#1f3c88] mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-sm text-gray-400 italic">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
