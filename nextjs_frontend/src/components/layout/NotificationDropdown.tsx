"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { getApiBaseUrl } from "@/utils/config";

interface Notification {
    notifID: number;
    userID: number;
    message: string;
    type: string;
    status: string;
    sent_at: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const API_BASE = getApiBaseUrl();

    useEffect(() => {
        fetchNotifications();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/notifications/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const notifs = data.notifications || [];
                setNotifications(notifs);
                setUnreadCount(notifs.filter((n: Notification) => n.status === "UNREAD").length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/notifications/read-all`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/notifications/bulk-delete`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => !selectedIds.includes(n.notifID)));

                // Adjust unreadCount if any deleted were UNREAD
                const deletedUnread = notifications.filter(n => selectedIds.includes(n.notifID) && n.status === "UNREAD").length;
                setUnreadCount(prev => Math.max(0, prev - deletedUnread));

                setSelectedIds([]);
                setIsSelectionMode(false);
            }
        } catch (error) {
            console.error("Error deleting notifications:", error);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle size={16} className="text-emerald-500" />;
            case "WARNING": return <AlertTriangle size={16} className="text-amber-500" />;
            case "ERROR": return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none flex items-center justify-center"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#e91e63] rounded-full border border-[#1f3c88] flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl py-2 z-[1001] animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <h3 className="text-gray-800 font-bold text-sm">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(!isSelectionMode);
                                        if (isSelectionMode) setSelectedIds([]);
                                    }}
                                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors tracking-wider ${isSelectionMode ? "bg-[#1f3c88] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                                >
                                    {isSelectionMode ? "Cancel" : "Select"}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isSelectionMode && selectedIds.length > 0 ? (
                                <button
                                    onClick={deleteSelected}
                                    className="text-xs text-white bg-red-600 hover:bg-red-700 shadow-sm font-semibold flex items-center gap-1 transition-all px-2 py-1 rounded"
                                >
                                    <Trash2 size={14} />
                                    Delete ({selectedIds.length})
                                </button>
                            ) : (
                                unreadCount > 0 && !isSelectionMode && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-[#1f3c88] hover:text-[#0d2b6b] font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                                    >
                                        <Check size={14} />
                                        Mark all as read
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1f3c88] rounded-full animate-spin"></div>
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <Bell size={20} className="text-gray-300" />
                                </div>
                                <div className="text-sm font-medium">No notifications right now</div>
                                <div className="text-xs text-gray-400">We'll let you know when there's an update.</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.notifID}
                                        className={`p-4 transition-colors hover:bg-gray-50 flex gap-3 items-start ${isSelectionMode ? "cursor-pointer" : "cursor-default"} ${notif.status === "UNREAD" ? "bg-blue-50/30" : ""}`}
                                        onClick={() => {
                                            if (isSelectionMode) toggleSelection(notif.notifID);
                                        }}
                                    >
                                        {isSelectionMode && (
                                            <div className="shrink-0 mt-0.5 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(notif.notifID)}
                                                    onChange={() => toggleSelection(notif.notifID)}
                                                    className="w-4 h-4 text-[#1f3c88] border-gray-300 rounded focus:ring-[#1f3c88] cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                        <div className="shrink-0 mt-0.5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm tracking-tight leading-snug break-words ${notif.status === "UNREAD" ? "text-gray-900 font-semibold" : "text-gray-600 font-medium"}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
                                                {formatDate(notif.sent_at)}
                                            </p>
                                        </div>
                                        {notif.status === "UNREAD" && (
                                            <div className="shrink-0 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-[#1f3c88]"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
