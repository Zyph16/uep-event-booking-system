"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}: ConfirmModalProps) {

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isDestructive ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>

                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 rounded-xl text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold shadow-md transition-colors ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
