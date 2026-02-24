"use client";

import React, { useEffect, useState } from "react";
import FacilityHero from "@/components/admin/facilities/FacilityHero";
import FacilityModal from "@/components/admin/facilities/FacilityModal";
import AlbumModal from "@/components/admin/facilities/AlbumModal";
import Modal from "@/components/shared/Modal";
import { getApiBaseUrl } from "@/utils/config";

// const API_BASE = "http://localhost:5000/api";
const API_BASE = getApiBaseUrl();

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [allEquipment, setAllEquipment] = useState<any[]>([]);
    const [allRooms, setAllRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedFacility, setSelectedFacility] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editFacilityTarget, setEditFacilityTarget] = useState<any>(null);

    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [albumFacilityTarget, setAlbumFacilityTarget] = useState<any>(null);

    // Delete Confirmation
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Initial Fetch
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            // Parallel Fetch
            const [facRes, eqRes, rmRes, meRes] = await Promise.all([
                fetch(`${API_BASE}/facilities`, { headers }),
                fetch(`${API_BASE}/equipment`, { headers }),
                fetch(`${API_BASE}/rooms`, { headers }),
                fetch(`${API_BASE}/users/me`, { headers })
            ]);

            const facData = await facRes.json();
            const eqData = await eqRes.json();
            const rmData = await rmRes.json();
            const meData = await meRes.json();

            const myAssignedIdsStrings = Array.isArray(meData?.user?.assigned_facilities)
                ? meData.user.assigned_facilities.map(String)
                : [];

            let loadedFacilities = Array.isArray(facData) ? facData : (facData.facilities || []);
            loadedFacilities = loadedFacilities.filter((f: any) => myAssignedIdsStrings.includes(String(f.facilityID || f.id)));

            setFacilities(loadedFacilities);
            setAllEquipment(eqData.equipment || []);
            setAllRooms(rmData.rooms || []);

            // Default select first if exists and none selected
            if (loadedFacilities.length > 0 && !selectedFacility) {
                setSelectedFacility(loadedFacilities[0]);
            } else if (selectedFacility) {
                // Refresh selected facility data
                const updated = loadedFacilities.find((f: any) => f.facilityID === selectedFacility.facilityID || f.id === selectedFacility.id);
                if (updated) setSelectedFacility(updated);
            }

            if (albumFacilityTarget) {
                const updatedAlbumTarget = loadedFacilities.find((f: any) => (f.facilityID || f.id) === (albumFacilityTarget.facilityID || albumFacilityTarget.id));
                if (updatedAlbumTarget) setAlbumFacilityTarget(updatedAlbumTarget);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // Feedback Modal State
    const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success"
    });

    const closeFeedback = () => setFeedbackModal({ ...feedbackModal, isOpen: false });

    const showFeedback = (title: string, message: string, type: "success" | "error") => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    // Handlers
    const handleAddFacility = () => {
        setEditFacilityTarget(null);
        setIsModalOpen(true);
    };

    const handleEditFacility = (facility: any) => {
        setEditFacilityTarget(facility);
        setIsModalOpen(true);
    };

    const handleOpenAlbum = (facility: any) => {
        setAlbumFacilityTarget(facility);
        setIsAlbumModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/facilities/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Delete failed");

            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchData();
            showFeedback("Success", "Facility deleted successfully.", "success");
        } catch (err) {
            setIsDeleteModalOpen(false);
            showFeedback("Error", "Failed to delete facility. Please try again.", "error");
        }
    };

    // Modal Save Handlers
    const saveFacility = async (formData: FormData) => {
        const token = localStorage.getItem("token");
        const url = editFacilityTarget
            ? `${API_BASE}/facilities/${editFacilityTarget.id || editFacilityTarget.facilityID}?_method=PUT`
            : `${API_BASE}/facilities`;

        try {
            const res = await fetch(url, {
                method: "POST", // Method spoofing for PUT if needed
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error("Result failed");

            setIsModalOpen(false);
            fetchData();
            showFeedback("Success", `Facility ${editFacilityTarget ? 'updated' : 'added'} successfully!`, "success");
        } catch (err) {
            showFeedback("Error", `Failed to update facility.`, "error");
        }
    };

    const saveEquipment = async (data: any) => {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        try {
            let res;
            if (data.id) {
                res = await fetch(`${API_BASE}/equipment/${data.id}`, { method: "PUT", headers, body: JSON.stringify(data) });
            } else {
                res = await fetch(`${API_BASE}/equipment`, { method: "POST", headers, body: JSON.stringify(data) });
            }

            if (!res.ok) throw new Error("Action failed");

            fetchData();
            showFeedback("Success", `Equipment ${data.id ? 'updated' : 'added'} successfully!`, "success");
        } catch (err) {
            showFeedback("Error", `Failed to ${data.id ? 'update' : 'add'} equipment.`, "error");
        }
    };

    const saveRoom = async (data: any) => {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        try {
            let res;
            if (data.id) {
                res = await fetch(`${API_BASE}/rooms/${data.id}`, { method: "PUT", headers, body: JSON.stringify(data) });
            } else {
                res = await fetch(`${API_BASE}/rooms`, { method: "POST", headers, body: JSON.stringify(data) });
            }

            if (!res.ok) throw new Error("Action failed");

            fetchData();
            showFeedback("Success", `Room ${data.id ? 'updated' : 'added'} successfully!`, "success");
        } catch (err) {
            showFeedback("Error", `Failed to ${data.id ? 'update' : 'add'} room.`, "error");
        }
    };

    const deleteEquipment = async (id: number) => {
        if (!confirm("Delete this equipment? It will be removed from all facilities.")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/equipment/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            fetchData();
            showFeedback("Success", "Equipment deleted successfully.", "success");
        } catch (err) {
            showFeedback("Error", "Failed to delete equipment.", "error");
        }
    };

    const deleteRoom = async (id: number) => {
        if (!confirm("Delete this room? It will be removed from all facilities.")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/rooms/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            fetchData();
            showFeedback("Success", "Room deleted successfully.", "success");
        } catch (err) {
            showFeedback("Error", "Failed to delete room.", "error");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading facilities...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">Manage Facilities {'>'}</div>

            {/* Hero Card */}
            <FacilityHero facility={selectedFacility} />

            {/* List Header */}
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-xl font-bold text-[#1f3c88]">Facility Management</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search facilities..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1f3c88]"
                        onChange={(e) => {
                            const term = e.target.value.toLowerCase();
                            // Simple local filtering logic if needed, or re-fetch
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#004080] text-white">
                            <th className="px-6 py-4 text-sm font-semibold">ID</th>
                            <th className="px-6 py-4 text-sm font-semibold">Facility Name</th>
                            <th className="px-6 py-4 text-sm font-semibold">Location</th>
                            <th className="px-6 py-4 text-sm font-semibold">Capacity</th>
                            <th className="px-6 py-4 text-sm font-semibold">Price</th>
                            <th className="px-6 py-4 text-sm font-semibold">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {facilities.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No facilities found</td>
                            </tr>
                        ) : (
                            facilities.map((fac: any) => (
                                <tr
                                    key={fac.facilityID || fac.id}
                                    onClick={() => setSelectedFacility(fac)}
                                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedFacility && (selectedFacility.id === fac.id || selectedFacility.facilityID === fac.facilityID) ? 'bg-blue-50' : ''}`}
                                >
                                    <td className="px-6 py-4 text-sm text-gray-600">#{fac.facilityID || fac.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{fac.facility_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fac.location}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fac.capacity}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">PHP {fac.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${fac.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {fac.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditFacility(fac); }}
                                                className="px-3 py-1 bg-white border border-[#1f3c88] text-[#1f3c88] rounded text-xs font-bold uppercase hover:bg-blue-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenAlbum(fac); }}
                                                className="px-3 py-1 bg-white border border-[#0267cb] text-[#0267cb] rounded text-xs font-bold uppercase hover:bg-blue-50"
                                            >
                                                Album
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <FacilityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                facilityToEdit={editFacilityTarget}
                allEquipment={allEquipment}
                allRooms={allRooms}
                onSaveFacility={saveFacility}
                onSaveEquipment={saveEquipment}
                onSaveRoom={saveRoom}
                onDeleteEquipment={deleteEquipment}
                onDeleteRoom={deleteRoom}
            />

            <AlbumModal
                isOpen={isAlbumModalOpen}
                onClose={() => setIsAlbumModalOpen(false)}
                facility={albumFacilityTarget}
                onAlbumUpdate={fetchData} // Refresh data after upload/delete
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                type="error"
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete this facility? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Permanently</button>
                    </div>
                </div>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                isOpen={feedbackModal.isOpen}
                onClose={closeFeedback}
                title={feedbackModal.title}
                type={feedbackModal.type}
            >
                <div>{feedbackModal.message}</div>
            </Modal>
        </div>
    );
}
