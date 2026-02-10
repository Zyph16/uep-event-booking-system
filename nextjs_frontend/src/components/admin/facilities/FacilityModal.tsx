"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, Edit2 } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface FacilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    facilityToEdit?: any;
    allEquipment: any[];
    allRooms: any[];
    onSaveFacility: (formData: FormData) => Promise<void>;
    onSaveEquipment: (data: any) => Promise<void>;
    onSaveRoom: (data: any) => Promise<void>;
    onDeleteEquipment: (id: number) => Promise<void>;
    onDeleteRoom: (id: number) => Promise<void>;
}

export default function FacilityModal({
    isOpen,
    onClose,
    facilityToEdit,
    allEquipment,
    allRooms,
    onSaveFacility,
    onSaveEquipment,
    onSaveRoom,
    onDeleteEquipment,
    onDeleteRoom
}: FacilityModalProps) {
    const [activeTab, setActiveTab] = useState<"facility" | "equipment" | "room">("facility");

    // Facility Form State
    const [facName, setFacName] = useState("");
    const [facLocation, setFacLocation] = useState("");
    const [facCapacity, setFacCapacity] = useState("");
    const [facPrice, setFacPrice] = useState("");
    const [facStatus, setFacStatus] = useState("available");
    const [facImage, setFacImage] = useState<File | null>(null);
    const [facImagePreview, setFacImagePreview] = useState<string>("");
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

    // Equipment Form State
    const [eqName, setEqName] = useState("");
    const [eqDesc, setEqDesc] = useState("");
    const [eqPrice, setEqPrice] = useState("");
    const [editingEqId, setEditingEqId] = useState<number | null>(null);

    // Room Form State
    const [rmName, setRmName] = useState("");
    const [rmCapacity, setRmCapacity] = useState("");
    const [rmPrice, setRmPrice] = useState("");
    const [editingRmId, setEditingRmId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize/Reset Form
    useEffect(() => {
        if (isOpen) {
            if (facilityToEdit) {
                setFacName(facilityToEdit.facility_name);
                setFacLocation(facilityToEdit.location);
                setFacCapacity(facilityToEdit.capacity);
                setFacPrice(facilityToEdit.price);
                setFacStatus(facilityToEdit.status);

                // Image
                if (facilityToEdit.imagepath) {
                    setFacImagePreview(
                        facilityToEdit.imagepath.startsWith('http')
                            ? facilityToEdit.imagepath
                            : `http://192.168.1.31:5000${facilityToEdit.imagepath}`
                    );
                } else {
                    setFacImagePreview("");
                }

                // Checkboxes (Wait, backend API structure for edits needs to be mapped)
                // Assuming facilityToEdit has arrays of IDs or Objects
                // Based on backend: facility.equipment is array of IDs (or objects). 
                // Let's assume the parent passes pre-processed ID strings or we handle it.
                if (facilityToEdit.equipment) {
                    setSelectedEquipment(facilityToEdit.equipment.map((e: any) => String(e.id || e.equipmentID || e)));
                } else {
                    setSelectedEquipment([]);
                }

                if (facilityToEdit.rooms) {
                    setSelectedRooms(facilityToEdit.rooms.map((r: any) => String(r.id || r.roomID || r)));
                } else {
                    setSelectedRooms([]);
                }
            } else {
                // Reset for New
                setFacName("");
                setFacLocation("");
                setFacCapacity("");
                setFacPrice("");
                setFacStatus("available");
                setFacImage(null);
                setFacImagePreview("");
                setSelectedEquipment([]);
                setSelectedRooms([]);
            }
            setActiveTab("facility");
        }
    }, [isOpen, facilityToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFacImage(file);
            setFacImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFacilitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("facility_name", facName);
        formData.append("location", facLocation);
        formData.append("capacity", facCapacity);
        formData.append("price", facPrice);
        formData.append("status", facStatus);

        if (selectedEquipment.length === 0) {
            formData.append("equipment[]", "EMPTY");
        } else {
            selectedEquipment.forEach(id => formData.append("equipment[]", id));
        }

        if (selectedRooms.length === 0) {
            formData.append("rooms[]", "EMPTY");
        } else {
            selectedRooms.forEach(id => formData.append("rooms[]", id));
        }

        if (facImage) {
            formData.append("image", facImage);
        }

        await onSaveFacility(formData);
    };

    const handleEquipmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSaveEquipment({
            id: editingEqId,
            equipment_name: eqName,
            description: eqDesc,
            price: eqPrice
        });
        // Reset
        setEqName("");
        setEqDesc("");
        setEqPrice("");
        setEditingEqId(null);
    };

    const handleRoomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSaveRoom({
            id: editingRmId,
            room_name: rmName,
            capacity: rmCapacity,
            price: rmPrice
        });
        // Reset
        setRmName("");
        setRmCapacity("");
        setRmPrice("");
        setEditingRmId(null);
    };

    // Helper for checkboxes
    const toggleSelection = (list: string[], setList: (L: string[]) => void, id: string) => {
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Tabs */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("facility")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'facility' ? 'bg-[#1f3c88] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {facilityToEdit ? 'Edit Facility' : 'Add Facility'}
                        </button>
                        <button
                            onClick={() => setActiveTab("equipment")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'equipment' ? 'bg-[#1f3c88] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Manage Equipment
                        </button>
                        <button
                            onClick={() => setActiveTab("room")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'room' ? 'bg-[#1f3c88] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Manage Rooms
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* --- FACILITY TAB --- */}
                    {activeTab === 'facility' && (
                        <form onSubmit={handleFacilitySubmit} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image Upload */}
                                <div className="w-full md:w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Facility Image</label>
                                    <div
                                        className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-all relative overflow-hidden group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {facImagePreview ? (
                                            <img src={facImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="text-gray-400 mb-2 group-hover:text-blue-500" size={32} />
                                                <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name *</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={facName} onChange={e => setFacName(e.target.value)} required placeholder="Enter name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={facLocation} onChange={e => setFacLocation(e.target.value)} required
                                        >
                                            <option value="">Select Location</option>
                                            <option value="UEP Main Campus - Catarman">UEP Main Campus - Catarman</option>
                                            <option value="UEP Laoang Campus - Laoang">UEP Laoang Campus - Laoang</option>
                                            <option value="UEP Catubig Campus - Catubig">UEP Catubig Campus - Catubig</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                                            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={facCapacity} onChange={e => setFacCapacity(e.target.value)} required
                                            >
                                                <option value="">Select Capacity</option>
                                                <option value="0-100">0 - 100</option>
                                                <option value="100-200">100 - 200</option>
                                                <option value="200-300">200 - 300</option>
                                                <option value="300-500">300 - 500</option>
                                                <option value="500-1000">500 - 1000</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (PHP) *</label>
                                            <input type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={facPrice} onChange={e => setFacPrice(e.target.value)} required placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={facStatus} onChange={e => setFacStatus(e.target.value)} required
                                        >
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Equipment</h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 scrollbar-thin">
                                        {allEquipment.map(eq => (
                                            <label key={eq.equipmentID} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEquipment.includes(String(eq.equipmentID))}
                                                    onChange={() => toggleSelection(selectedEquipment, setSelectedEquipment, String(eq.equipmentID))}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{eq.equipment_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Rooms</h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 scrollbar-thin">
                                        {allRooms.map(rm => (
                                            <label key={rm.roomID} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRooms.includes(String(rm.roomID))}
                                                    onChange={() => toggleSelection(selectedRooms, setSelectedRooms, String(rm.roomID))}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{rm.room_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2 bg-[#1f3c88] text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors">
                                    {facilityToEdit ? 'Update Facility' : 'Add Facility'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- EQUIPMENT TAB --- */}
                    {activeTab === 'equipment' && (
                        <div>
                            <form onSubmit={handleEquipmentSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <h4 className="font-bold text-gray-700 mb-3">{editingEqId ? 'Edit Equipment' : 'Add New Equipment'}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <input type="text" placeholder="Name" className="px-3 py-2 rounded border"
                                        value={eqName} onChange={e => setEqName(e.target.value)} required />
                                    <input type="text" placeholder="Description (Optional)" className="px-3 py-2 rounded border"
                                        value={eqDesc} onChange={e => setEqDesc(e.target.value)} />
                                    <input type="number" placeholder="Price" className="px-3 py-2 rounded border"
                                        value={eqPrice} onChange={e => setEqPrice(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    {editingEqId && (
                                        <button type="button" onClick={() => { setEditingEqId(null); setEqName(''); setEqDesc(''); setEqPrice(''); }} className="text-sm text-gray-500 underline">Cancel Edit</button>
                                    )}
                                    <button type="submit" className="px-4 py-2 bg-[#1f3c88] text-white text-sm font-semibold rounded hover:bg-blue-900">
                                        {editingEqId ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {allEquipment.map(eq => (
                                    <div key={eq.equipmentID} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <div className="font-semibold text-gray-800">{eq.equipment_name}</div>
                                            <div className="text-xs text-gray-500">PHP {eq.price} • {eq.description}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => {
                                                setEditingEqId(eq.equipmentID);
                                                setEqName(eq.equipment_name);
                                                setEqDesc(eq.description);
                                                setEqPrice(eq.price);
                                            }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                            <button onClick={() => onDeleteEquipment(eq.equipmentID)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- ROOM TAB --- */}
                    {activeTab === 'room' && (
                        <div>
                            <form onSubmit={handleRoomSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <h4 className="font-bold text-gray-700 mb-3">{editingRmId ? 'Edit Room' : 'Add New Room'}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <input type="text" placeholder="Room Name" className="px-3 py-2 rounded border"
                                        value={rmName} onChange={e => setRmName(e.target.value)} required />
                                    <input type="number" placeholder="Capacity (Optional)" className="px-3 py-2 rounded border"
                                        value={rmCapacity} onChange={e => setRmCapacity(e.target.value)} />
                                    <input type="number" placeholder="Price" className="px-3 py-2 rounded border"
                                        value={rmPrice} onChange={e => setRmPrice(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    {editingRmId && (
                                        <button type="button" onClick={() => { setEditingRmId(null); setRmName(''); setRmCapacity(''); setRmPrice(''); }} className="text-sm text-gray-500 underline">Cancel Edit</button>
                                    )}
                                    <button type="submit" className="px-4 py-2 bg-[#1f3c88] text-white text-sm font-semibold rounded hover:bg-blue-900">
                                        {editingRmId ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {allRooms.map(rm => (
                                    <div key={rm.roomID} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <div className="font-semibold text-gray-800">{rm.room_name}</div>
                                            <div className="text-xs text-gray-500">PHP {rm.price} • {rm.capacity ? `${rm.capacity} pax` : 'N/A'}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => {
                                                setEditingRmId(rm.roomID);
                                                setRmName(rm.room_name);
                                                setRmCapacity(rm.capacity);
                                                setRmPrice(rm.price);
                                            }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                            <button onClick={() => onDeleteRoom(rm.roomID)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
