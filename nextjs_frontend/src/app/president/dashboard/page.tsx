"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    Clock,
    Calendar as CalendarIcon,
    AlertCircle
} from "lucide-react";
import Calendar from "@/components/shared/Calendar";
import { EventInput } from "@fullcalendar/core";

const API_BASE = "http://192.168.1.31:5000/api";

export default function PresidentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [stats, setStats] = useState({
        newBookings: 0,
        upcomingEvents: 0,
        pending: 0
    });
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, items: any[], title: string, locked?: boolean } | null>(null);
    const [selectedFacility, setSelectedFacility] = useState<string>("All");
    const router = useRouter();

    // Map bookings to FullCalendar events
    const mapBookingsToEvents = (bookingList: any[]): EventInput[] => {
        const tempMap = new Map<string, any>();

        bookingList.forEach(b => {
            const status = (b.status || "").toLowerCase();
            let color = "#f1c40f"; // Gold/Default
            let type = "Other";

            if (status.includes("approved")) {
                color = "#22c55e"; // Green
                type = "Approved";
            } else if (status.includes("payment confirmed")) {
                color = "#f97316";
                type = "Final Review";
            } else if (status.includes("reviewed")) {
                color = "#3b82f6"; // Blue
                type = "Initial Review";
            } else if (status.includes("pending")) {
                color = "#94a3b8";
                type = "Client Pending";
            }

            // Dates
            const start = new Date(b.date_start || b.date_requested);
            const end = new Date(b.date_end || (b.date_start || b.date_requested));
            const current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const key = `${dateStr}-${color}`;

                if (!tempMap.has(key)) {
                    tempMap.set(key, {
                        title: type,
                        start: dateStr,
                        backgroundColor: color,
                        borderColor: 'transparent',
                        extendedProps: {
                            items: [{
                                facility: b.facility_name,
                                time: `${b.time_start} - ${b.time_end}`,
                                purpose: b.purpose,
                                user: b.user_name
                            }]
                        }
                    });
                } else {
                    tempMap.get(key).extendedProps.items.push({
                        facility: b.facility_name,
                        time: `${b.time_start} - ${b.time_end}`,
                        purpose: b.purpose,
                        user: b.user_name
                    });
                }
                current.setDate(current.getDate() + 1);
            }

            // Setup Dots
            if (b.setup_date_start) {
                const sStart = new Date(b.setup_date_start);
                const sEnd = new Date(b.setup_date_end || b.setup_date_start);
                const sCurr = new Date(sStart);
                while (sCurr <= sEnd) {
                    const sDateStr = sCurr.toISOString().split('T')[0];
                    const sKey = `${sDateStr}-#0ea5e9`; // Sky Blue

                    if (!tempMap.has(sKey)) {
                        tempMap.set(sKey, {
                            title: "Setup",
                            start: sDateStr,
                            backgroundColor: "#0ea5e9",
                            borderColor: 'transparent',
                            extendedProps: {
                                items: [{
                                    facility: b.facility_name,
                                    time: `Setup: ${b.setup_time_start || 'N/A'}`,
                                    purpose: "Event Preparation"
                                }]
                            }
                        });
                    } else {
                        tempMap.get(sKey).extendedProps.items.push({
                            facility: b.facility_name,
                            time: `Setup: ${b.setup_time_start || 'N/A'}`,
                            purpose: "Event Preparation"
                        });
                    }
                    sCurr.setDate(sCurr.getDate() + 1);
                }
            }
        });

        return Array.from(tempMap.values());
    };

    const events = React.useMemo(() => {
        let filtered = bookings;
        if (selectedFacility !== "All") {
            filtered = bookings.filter(b => b.facility_name === selectedFacility);
        }
        return mapBookingsToEvents(filtered);
    }, [bookings, selectedFacility]);

    const facilities = React.useMemo(() => {
        const unique = new Set(bookings.map(b => b.facility_name));
        return Array.from(unique).sort();
    }, [bookings]);

    const getTooltipData = (date: Date, element: HTMLElement) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.start === dateStr);
        if (dayEvents.length === 0) return null;

        const uniqueTitles = new Set<string>();
        let allItems: any[] = [];

        dayEvents.forEach(e => {
            uniqueTitles.add(e.title as string);
            if (e.extendedProps?.items) {
                allItems = [...allItems, ...e.extendedProps.items];
            }
        });

        const title = uniqueTitles.size > 1 ? "Bookings" : Array.from(uniqueTitles)[0];
        const rect = element.getBoundingClientRect();

        return {
            x: rect.left + (rect.width / 2),
            y: rect.top,
            items: allItems,
            title: title
        };
    };

    const handleDayMouseEnter = (arg: { date: Date, el: HTMLElement, jsEvent: MouseEvent }) => {
        if (tooltip?.locked) return;
        const data = getTooltipData(arg.date, arg.el);
        if (data) setTooltip({ ...data, locked: false });
        else setTooltip(null);
    };

    const handleDayMouseLeave = () => {
        if (tooltip?.locked) return;
        setTooltip(null);
    };

    const handleDateClick = (arg: any) => {
        const data = getTooltipData(arg.date, arg.dayEl);
        if (data) setTooltip({ ...data, locked: true });
        else setTooltip(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const userData = localStorage.getItem("user");

                if (!token || !userData) {
                    router.push("/login");
                    return;
                }

                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                const res = await fetch(`${API_BASE}/bookings/details`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                const allBookings = data.bookings || [];

                setBookings(allBookings);

                // President specific pending: Reviewed or Payment Confirmed
                const presidentPending = allBookings.filter((b: any) => {
                    const s = b.status?.toLowerCase() || '';
                    return s.includes('reviewed') || s.includes('payment confirmed');
                });

                const approvedCount = allBookings.filter((b: any) => b.status?.toLowerCase() === 'approved').length;

                setStats({
                    newBookings: presidentPending.length,
                    upcomingEvents: approvedCount,
                    pending: presidentPending.length
                });

                setPendingRequests(presidentPending.sort((a: any, b: any) => new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()));

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Stats Cards - MOVED TO TOP */}
            <div className="grid grid-cols-3 gap-2 md:gap-6">
                <div className="bg-gradient-to-br from-[#1f3c88] to-[#0d2b6b] p-3 md:p-8 rounded-xl md:rounded-2xl text-white shadow-lg relative group overflow-hidden flex flex-col justify-center items-center md:items-start text-center md:text-left h-[100px] md:h-auto">
                    <div className="relative z-10 w-full">
                        <h3 className="text-[10px] md:text-lg font-medium opacity-80 mb-1 leading-tight">New</h3>
                        <div className="text-xl md:text-5xl font-bold">{String(stats.newBookings).padStart(2, '0')}</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#e91e63] to-[#c2185b] p-3 md:p-8 rounded-xl md:rounded-2xl text-white shadow-lg relative group overflow-hidden flex flex-col justify-center items-center md:items-start text-center md:text-left h-[100px] md:h-auto">
                    <div className="relative z-10 w-full">
                        <h3 className="text-[10px] md:text-lg font-medium opacity-80 mb-1 leading-tight">Signed</h3>
                        <div className="text-xl md:text-5xl font-bold">{String(stats.upcomingEvents).padStart(2, '0')}</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 md:p-8 rounded-xl md:rounded-2xl text-white shadow-lg relative group overflow-hidden flex flex-col justify-center items-center md:items-start text-center md:text-left h-[100px] md:h-auto">
                    <div className="relative z-10 w-full">
                        <h3 className="text-[10px] md:text-lg font-medium opacity-80 mb-1 leading-tight">Pending</h3>
                        <div className="text-xl md:text-5xl font-bold">{String(stats.pending).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>

            {/* Calendar + Pending List */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-auto lg:h-[600px] relative">

                {/* Calendar */}
                <div className="lg:w-[65%] bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col overflow-hidden">
                    <div className="flex flex-row justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CalendarIcon size={20} className="text-[#1f3c88]" />
                            <span className="hidden md:inline">Event Calendar</span>
                            <span className="md:hidden">Calendar</span>
                        </h2>

                        {/* Facility Dropdown */}
                        <select
                            value={selectedFacility}
                            onChange={(e) => setSelectedFacility(e.target.value)}
                            className="text-xs md:text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1f3c88] max-w-[150px] md:max-w-xs"
                        >
                            <option value="All">All Facilities</option>
                            {facilities.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full h-[400px] md:h-[600px] bg-white rounded-2xl overflow-hidden relative">
                        <Calendar
                            events={events}
                            onDayMouseEnter={handleDayMouseEnter}
                            onDayMouseLeave={handleDayMouseLeave}
                            onDateClick={handleDateClick}
                        />
                    </div>

                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            className={`fixed z-[9999] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-100/50 animate-in fade-in zoom-in-95 duration-200 ${tooltip.locked ? 'pointer-events-auto' : 'pointer-events-none'}`}
                            style={{
                                top: tooltip.y - 12,
                                left: tooltip.x,
                                transform: 'translate(-50%, -100%)',
                                minWidth: '260px',
                                maxWidth: '320px'
                            }}
                        >
                            {tooltip.locked && (
                                <button
                                    onClick={() => setTooltip(null)}
                                    className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            )}
                            <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2 pr-6">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltip.items[0]?.color || '#3b82f6' }}></span>
                                    {tooltip.title}
                                </h4>
                                <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                    {tooltip.items.length} Item{tooltip.items.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {tooltip.items.map((item: any, i: number) => (
                                    <div key={i} className="text-xs p-2 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50">
                                        <div className="font-bold text-gray-700 mb-0.5 flex justify-between">
                                            {item.facility}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                            <span>🕒 {item.time}</span>
                                        </div>
                                        <div className="text-gray-600 leading-snug">
                                            {item.user ? `${item.user}: ` : ""}{item.purpose}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 shadow-sm border-b border-r border-gray-100"></div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-4 md:mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#22c55e]"></span> Approved
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Initial Review
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#f97316]"></span> Final Review
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#0ea5e9]"></span> Setup
                        </div>
                    </div>
                </div>

                {/* Pending List */}
                <div className="lg:w-[35%] bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col overflow-hidden">
                    <h2 className="text-lg font-bold text-[#d97706] mb-4 border-b border-gray-100 pb-2">
                        Pending My Approval
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-2 scrollbar-thin">
                        {pendingRequests.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CheckCircle size={32} className="mb-2 opacity-20" />
                                <p className="text-sm italic">All caught up!</p>
                            </div>
                        ) : (
                            pendingRequests.map((req, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-all group">
                                    <div className="font-bold text-gray-800 text-sm mb-1 truncate group-hover:text-[#d97706] transition-colors">
                                        {req.user_name || "Unknown User"}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2 font-medium">{req.facility_name}</div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                            <Clock size={12} />
                                            {new Date(req.date_requested).toLocaleDateString()}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 uppercase tracking-wider">
                                            Awaiting Action
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
