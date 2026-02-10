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

export default function PMDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [stats, setStats] = useState({
        newBookings: 0,
        upcomingEvents: 0,
        pending: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [tooltip, setTooltip] = useState<{ x: number, y: number, items: any[], title: string, locked?: boolean } | null>(null);
    const router = useRouter();

    // Map bookings to FullCalendar events (Grouped like Landing Page)
    const mapBookingsToEvents = (bookingList: any[]): EventInput[] => {
        const tempMap = new Map<string, any>();

        bookingList.forEach(b => {
            const status = (b.status || "").toLowerCase();
            let color = "#f97316"; // Orange/Pending
            let type = "Pending";

            if (status === "approved" || status === "pre_approved") {
                color = "#22c55e"; // Green
                type = "Approved";
            } else if (status === "reviewed") {
                color = "#3b82f6"; // Blue
                type = "Reviewed";
            }

            // Helper to split multi-day bookings
            const start = new Date(b.date_start || b.date_requested);
            const end = new Date(b.date_end || (b.date_start || b.date_requested));
            const current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const key = `${dateStr}-${color}`; // Group by date and color

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

            // Setup Dots (Pink like landing page)
            if (b.setup_date_start) {
                const sStart = new Date(b.setup_date_start);
                const sEnd = new Date(b.setup_date_end || b.setup_date_start);
                const sCurr = new Date(sStart);
                while (sCurr <= sEnd) {
                    const sDateStr = sCurr.toISOString().split('T')[0];
                    const sKey = `${sDateStr}-#ec4899`;

                    if (!tempMap.has(sKey)) {
                        tempMap.set(sKey, {
                            title: "Setup",
                            start: sDateStr,
                            backgroundColor: "#ec4899",
                            borderColor: 'transparent',
                            extendedProps: {
                                items: [{
                                    facility: b.facility_name,
                                    time: `Setup: ${b.setup_time_start} - ${b.setup_time_end || 'N/A'}`,
                                    purpose: "Event Preparation"
                                }]
                            }
                        });
                    } else {
                        tempMap.get(sKey).extendedProps.items.push({
                            facility: b.facility_name,
                            time: `Setup: ${b.setup_time_start} - ${b.setup_time_end || 'N/A'}`,
                            purpose: "Event Preparation"
                        });
                    }
                    sCurr.setDate(sCurr.getDate() + 1);
                }
            }
        });

        return Array.from(tempMap.values());
    };

    const events = React.useMemo(() => mapBookingsToEvents(bookings), [bookings]);

    // Tooltip Helpers (Identical to Hero.tsx)
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

                // Fetch all bookings with details
                const res = await fetch(`${API_BASE}/bookings/details`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                const allBookings = data.bookings || [];

                // Filter by assigned facilities if PM
                let filtered = allBookings;
                if (parsedUser.role_name === "PROJECT MANAGER" && parsedUser.assigned_facilities) {
                    const allowed = parsedUser.assigned_facilities.map(Number);
                    filtered = allBookings.filter((b: any) => allowed.includes(Number(b.facilityID)));
                }

                setBookings(filtered);

                // Calculate Stats
                const pending = filtered.filter((b: any) => {
                    const s = b.status?.toLowerCase() || '';
                    return s === 'pending' || s.includes('reviewed') || s.includes('billing signed') || s.includes('awaiting payment');
                });

                const approvedCount = filtered.filter((b: any) => b.status?.toLowerCase() === 'approved').length;

                setStats({
                    newBookings: pending.length,
                    upcomingEvents: approvedCount,
                    pending: pending.length
                });

                setPendingRequests(pending.sort((a: any, b: any) => new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()));

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
                    <AlertCircle className="hidden md:block absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-gradient-to-br from-[#e91e63] to-[#c2185b] p-3 md:p-8 rounded-xl md:rounded-2xl text-white shadow-lg relative group overflow-hidden flex flex-col justify-center items-center md:items-start text-center md:text-left h-[100px] md:h-auto">
                    <div className="relative z-10 w-full">
                        <h3 className="text-[10px] md:text-lg font-medium opacity-80 mb-1 leading-tight">Upcoming</h3>
                        <div className="text-xl md:text-5xl font-bold">{String(stats.upcomingEvents).padStart(2, '0')}</div>
                    </div>
                    <CalendarIcon className="hidden md:block absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 md:p-8 rounded-xl md:rounded-2xl text-white shadow-lg relative group overflow-hidden flex flex-col justify-center items-center md:items-start text-center md:text-left h-[100px] md:h-auto">
                    <div className="relative z-10 w-full">
                        <h3 className="text-[10px] md:text-lg font-medium opacity-80 mb-1 leading-tight">Pending</h3>
                        <div className="text-xl md:text-5xl font-bold">{String(stats.pending).padStart(2, '0')}</div>
                    </div>
                    <Clock className="hidden md:block absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[600px] h-auto relative">

                {/* Calendar Container matching Hero.tsx */}
                <div className="lg:w-[65%] w-full flex flex-col">
                    <div className="w-full h-[340px] md:h-[450px] bg-white rounded-[20px] shadow-md relative overflow-hidden mb-1 border border-gray-100">
                        <Calendar
                            events={events}
                            onDayMouseEnter={handleDayMouseEnter}
                            onDayMouseLeave={handleDayMouseLeave}
                            onDateClick={handleDateClick}
                        />
                    </div>

                    {/* Custom Hover Modal/Tooltip */}
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
                                    <span className={`w-2 h-2 rounded-full ${tooltip.title === 'Approved' ? 'bg-[#22c55e]' :
                                        tooltip.title === 'Pending' ? 'bg-[#f97316]' :
                                            tooltip.title === 'Setup' ? 'bg-[#ec4899]' : 'bg-[#3b82f6]'
                                        }`}></span>
                                    {tooltip.title}
                                </h4>
                                <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                    {tooltip.items.length} Item{tooltip.items.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {tooltip.items.map((item: any, i: number) => (
                                    <div key={i} className="text-xs group hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
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

                    {/* Legends */}
                    <div className="w-full flex flex-wrap justify-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white shadow-sm mb-10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#22c55e] shadow-sm"></div>
                            <span className="text-xs font-semibold text-gray-600">Approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#f97316] shadow-sm"></div>
                            <span className="text-xs font-semibold text-gray-600">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ec4899] shadow-sm"></div>
                            <span className="text-xs font-semibold text-gray-600">Setup</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-sm"></div>
                            <span className="text-xs font-semibold text-gray-600">Reviewed</span>
                        </div>
                    </div>
                </div>

                {/* Pending List */}
                <div className="lg:w-[35%] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
                    <div className="flex flex-col gap-4 mb-4 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-[#d97706]">
                            Action Required
                        </h2>

                        {/* Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {["All", "Pending", "Billing", "Payment"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${activeFilter === filter
                                        ? "bg-gray-800 text-white border-gray-800"
                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                        {pendingRequests.filter(req => {
                            const status = (req.status || "").toLowerCase();
                            if (activeFilter === "Pending") return status === 'pending';
                            if (activeFilter === "Billing") return status.includes("reviewed");
                            if (activeFilter === "Payment") return status.includes("billing signed") || status.includes("awaiting payment");
                            return true;
                        }).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CheckCircle size={32} className="mb-2 opacity-20" />
                                <p className="text-sm italic">No {activeFilter === 'All' ? 'pending' : activeFilter.toLowerCase()} items.</p>
                            </div>
                        ) : (
                            pendingRequests
                                .filter(req => {
                                    const status = (req.status || "").toLowerCase();
                                    if (activeFilter === "Pending") return status === 'pending';
                                    if (activeFilter === "Billing") return status.includes("reviewed");
                                    if (activeFilter === "Payment") return status.includes("billing signed") || status.includes("awaiting payment");
                                    return true;
                                })
                                .map((req, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-gray-800 text-sm truncate">{req.user_name || "Unknown User"}</div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${req.status.toLowerCase().includes('reviewed') ? 'bg-blue-100 text-blue-700' :
                                                (req.status.toLowerCase().includes('billing signed') || req.status.toLowerCase().includes('awaiting payment')) ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {req.status.toLowerCase().includes('reviewed') ? 'For Billing' :
                                                    (req.status.toLowerCase().includes('billing signed') || req.status.toLowerCase().includes('awaiting payment')) ? 'Confirm Payment' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-2">{req.facility_name}</div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white px-2 py-1 rounded-md inline-block">
                                            <Clock size={10} />
                                            Requested: {new Date(req.date_requested).toLocaleString()}
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
