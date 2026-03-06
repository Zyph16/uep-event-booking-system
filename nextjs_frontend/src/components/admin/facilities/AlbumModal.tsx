"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import { Plus, Trash2, Folder, Image as ImageIcon, Upload, ArrowLeft, X } from "lucide-react";
import { getApiBaseUrl, getBackendUrl, getDisplayImageUrl } from "@/utils/config";

const API_BASE = getApiBaseUrl();
const BACKEND_URL = getBackendUrl();

interface AlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
    facility: any;
    onAlbumUpdate: () => void;
}

export default function AlbumModal({ isOpen, onClose, facility, onAlbumUpdate }: AlbumModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [newAlbumName, setNewAlbumName] = useState("");
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

    // null = viewing folders list; object = viewing inside a specific folder
    const [currentAlbum, setCurrentAlbum] = useState<any | null>(null);

    // Sync currentAlbum with incoming facility prop changes
    useEffect(() => {
        if (facility && currentAlbum) {
            const updatedAlbum = facility.albums?.find((a: any) => a.id === currentAlbum.id);
            if (updatedAlbum) {
                setCurrentAlbum(updatedAlbum);
            } else {
                // Folder might have been deleted
                setCurrentAlbum(null);
            }
        }
    }, [facility]);

    // Reset view when modal opens/closes for a different facility
    useEffect(() => {
        if (!isOpen) {
            setCurrentAlbum(null);
            setNewAlbumName("");
            setSelectedFiles([]);
        }
    }, [isOpen]);

    if (!facility) return null;

    const albums = facility.albums || [];

    // --- FOLDER LEVEL ACTIONS ---
    const handleCreateAlbum = async () => {
        if (!newAlbumName.trim()) return;
        setIsCreatingAlbum(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/facilities/${facility.facilityID || facility.id}/albums`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newAlbumName.trim() })
            });

            if (!res.ok) throw new Error("Failed to create album");
            setNewAlbumName("");
            onAlbumUpdate();
        } catch (err) {
            alert("Failed to create folder.");
        } finally {
            setIsCreatingAlbum(false);
        }
    };

    const handleDeleteAlbum = async (e: React.MouseEvent, albumId: number) => {
        e.stopPropagation(); // Prevent opening the folder
        if (!confirm("Are you sure you want to delete this folder and ALL its contents?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/facilities/albums/${albumId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Delete failed");
            onAlbumUpdate();
        } catch (err) {
            alert("Failed to delete folder.");
        }
    };

    // --- INSIDE FOLDER ACTIONS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !currentAlbum) return;

        setIsUploading(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append("images", file);
        });

        try {
            const res = await fetch(`${API_BASE}/facilities/albums/${currentAlbum.id}/images`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Backend Error Details:", errorData);
                throw new Error(errorData.error || errorData.detail || `Upload failed with status ${res.status}`);
            }

            setSelectedFiles([]);
            onAlbumUpdate();
        } catch (err: any) {
            alert(`Failed to upload images: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm("Are you sure you want to delete this picture?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/facilities/albums/images/${imageId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Delete failed");
            onAlbumUpdate();
        } catch (err) {
            alert("Failed to delete image.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Albums: ${facility.facility_name}`}>
            <div className="space-y-6">

                {/* ROOT VIEW: FOLDERS LIST */}
                {!currentAlbum && (
                    <div className="animate-in fade-in duration-300">
                        {/* Create Folder Section */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-blue-900 mb-1">Create New Folder</label>
                                <input
                                    type="text"
                                    value={newAlbumName}
                                    onChange={(e) => setNewAlbumName(e.target.value)}
                                    placeholder="e.g. Renovation 2024"
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                    disabled={isCreatingAlbum}
                                />
                            </div>
                            <button
                                onClick={handleCreateAlbum}
                                disabled={!newAlbumName.trim() || isCreatingAlbum}
                                className="w-full md:w-auto mt-4 md:mt-0 px-4 py-2 bg-[#0267cb] text-white text-sm font-semibold rounded-lg hover:bg-[#004080] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCreatingAlbum ? "Creating..." : <><Plus size={16} /> Create</>}
                            </button>
                        </div>

                        {/* Folders Grid */}
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Folder size={18} className="text-yellow-500" /> Existing Folders
                        </h4>

                        {albums.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                                No folders created yet. Make one above!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 custom-scrollbar max-h-[350px] overflow-y-auto pr-2">
                                {albums.map((album: any) => (
                                    <div
                                        key={album.id}
                                        onClick={() => setCurrentAlbum(album)}
                                        className="relative group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 min-h-[120px]"
                                    >
                                        <Folder size={48} className="text-yellow-400 group-hover:scale-110 transition-transform" fill="currentColor" />
                                        <span className="text-sm font-semibold text-gray-700 text-center line-clamp-2 w-full">{album.name}</span>
                                        <span className="text-xs text-gray-400">{album.images?.length || 0} items</span>

                                        {/* Delete Folder Button */}
                                        <button
                                            onClick={(e) => handleDeleteAlbum(e, album.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity"
                                            title="Delete Folder"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* INNER VIEW: INSIDE A FOLDER */}
                {currentAlbum && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        {/* Header back button */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setCurrentAlbum(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Folder className="text-yellow-500" fill="currentColor" size={24} />
                                {currentAlbum.name}
                            </h3>
                        </div>

                        {/* Upload Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Pictures to Folder</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                />
                                {selectedFiles.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">{selectedFiles.length} file(s) selected</p>
                                )}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || isUploading}
                                className="w-full md:w-auto mt-4 md:mt-0 px-4 py-2 bg-[#0267cb] text-white text-sm font-semibold rounded-lg hover:bg-[#004080] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? "Uploading..." : <><Upload size={16} /> Upload</>}
                            </button>
                        </div>

                        {/* Photos Grid */}
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ImageIcon size={18} /> Photos in "{currentAlbum.name}"
                        </h4>

                        {!currentAlbum.images || currentAlbum.images.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                                No photos inside this folder yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentAlbum.images.map((img: any) => (
                                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-100">
                                        <img
                                            src={getDisplayImageUrl(img.image_path)}
                                            alt="Facility Album"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform scale-90 group-hover:scale-100 transition-transform shadow-lg"
                                                title="Delete Photo"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </Modal>
    );
}
