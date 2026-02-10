"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function StatusModal({
    isOpen,
    onClose,
    status,
    title,
    message,
    actionLabel = "Okay",
    onAction
}: StatusModalProps) {

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [isOpen]);

    if (!isOpen) return null;

    const getStatusConfig = () => {
        switch (status) {
            case "success":
                return {
                    icon: <CheckCircle size={48} className="text-green-500" />,
                    bg: "bg-green-50",
                    btnBg: "bg-green-600 hover:bg-green-700",
                    titleColor: "text-green-800"
                };
            case "error":
                return {
                    icon: <AlertCircle size={48} className="text-red-500" />,
                    bg: "bg-red-50",
                    btnBg: "bg-red-600 hover:bg-red-700",
                    titleColor: "text-red-800"
                };
            case "warning":
                return {
                    icon: <AlertTriangle size={48} className="text-amber-500" />,
                    bg: "bg-amber-50",
                    btnBg: "bg-amber-600 hover:bg-amber-700",
                    titleColor: "text-amber-800"
                };
            case "info":
            default:
                return {
                    icon: <Info size={48} className="text-blue-500" />,
                    bg: "bg-blue-50",
                    btnBg: "bg-blue-600 hover:bg-blue-700",
                    titleColor: "text-blue-800"
                };
        }
    };

    const config = getStatusConfig();
    const handleAction = () => {
        if (onAction) onAction();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center text-center p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                {/* Icon Circle */}
                <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center mb-4`}>
                    {config.icon}
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-bold mb-2 ${config.titleColor}`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Action Button */}
                <button
                    onClick={handleAction}
                    className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all transform active:scale-95 ${config.btnBg}`}
                >
                    {actionLabel}
                </button>

            </div>
        </div>
    );
}
