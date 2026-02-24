"use client";

import React, { useState, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Image from "next/image";
import { getApiBaseUrl } from "@/utils/config";
import toast from "react-hot-toast";

interface UploadReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number | null;
    onUploadSuccess: () => void;
}

export default function UploadReceiptModal({ isOpen, onClose, bookingId, onUploadSuccess }: UploadReceiptModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen || !bookingId) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Basic validation
            if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
                toast.error("Please select an image or PDF file.");
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size should not exceed 5MB.");
                return;
            }

            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreviewUrl(null); // PDF preview handling can be complex, skip for now or show an icon
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setIsUploading(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const API_BASE = getApiBaseUrl();
            const res = await fetch(`${API_BASE}/bookings/${bookingId}/upload-receipt`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to upload receipt");
            }

            toast.success("Receipt uploaded successfully! Your booking is now under review.");
            onUploadSuccess();
            handleClose();
        } catch (err: any) {
            console.error("Upload error:", err);
            toast.error(err.message || "An expected error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold font-heading text-primary flex items-center gap-2">
                            <Upload className="text-primary/80" size={20} />
                            Upload Receipt
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">Booking #{bookingId}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Information Alert */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <p>
                                Please upload a clear image or PDF of your payment receipt.
                                Maximum file size: <strong>5MB</strong>.
                            </p>
                        </div>

                        {/* Upload Area */}
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                            />

                            {!file ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
                                >
                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-transform shadow-sm mb-3 text-gray-400 group-hover:text-primary">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Click to browse files</p>
                                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF</p>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg p-4 relative">
                                    <button
                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 border border-gray-100 z-10"
                                        title="Remove file"
                                    >
                                        <X size={14} />
                                    </button>

                                    {previewUrl ? (
                                        <div className="relative w-full h-48 rounded bg-gray-50 mb-3 overflow-hidden border border-gray-100 flex items-center justify-center">
                                            <Image
                                                src={previewUrl}
                                                alt="Receipt Preview"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-24 rounded bg-gray-50 mb-3 border border-gray-100 flex items-center justify-center text-gray-400">
                                            <FileText size={32} />
                                            <span className="ml-2 font-medium">PDF Document</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        <span className="truncate font-medium flex-1" title={file.name}>{file.name}</span>
                                        <span className="text-gray-500 text-xs shrink-0">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:bg-primary/50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 shadow-sm"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} /> Submit Receipt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
