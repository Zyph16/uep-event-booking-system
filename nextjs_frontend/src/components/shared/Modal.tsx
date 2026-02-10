"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: "default" | "success" | "error";
}

export default function Modal({ isOpen, onClose, title, children, type = "default" }: ModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b border-gray-100 ${type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-white'
                    }`}>
                    <div className="flex items-center gap-2">
                        {type === 'success' && <CheckCircle className="text-green-600" size={20} />}
                        {type === 'error' && <AlertCircle className="text-red-600" size={20} />}
                        <h3 className={`font-bold text-lg ${type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-gray-800'
                            }`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-gray-600 leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Close
                    </button>
                    {type === 'success' && (
                        <button
                            onClick={onClose}
                            className="ml-3 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform active:scale-95 duration-150"
                        >
                            Okay
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
