"use client";

import Link from "next/link";
import Calendar from "@/components/shared/Calendar";
import { useEffect, useState } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";

export default function Hero() {
    const [events, setEvents] = useState<any[]>([]);
    const [rawBookings, setRawBookings] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [selectedFacility, setSelectedFacility] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [tooltip, setTooltip] = useState<{ x: number, y: number, items: any[], title: string, locked?: boolean, placement?: 'top' | 'bottom', arrowOffset?: number } | null>(null);

    // Helper to get tooltip data for a specific date
    const getTooltipData = (date: Date, element: HTMLElement) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const dayEvents = events.filter(e => e.start === dateStr);
        if (dayEvents.length === 0) return null;

        const uniqueTitles = new Set<string>();
        let allItems: any[] = [];

        dayEvents.forEach(e => {
            uniqueTitles.add(e.title);
            if (e.extendedProps?.items) {
                allItems = [...allItems, ...e.extendedProps.items];
            }
        });

        const title = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const rect = element.getBoundingClientRect();

        // Horizontal Constraint
        const screenWidth = window.innerWidth;
        const tooltipMaxWidth = Math.min(320, screenWidth - 20);
        const halfWidth = tooltipMaxWidth / 2;

        const originalCenterX = rect.left + (rect.width / 2);

        // Clamp X to stay within screen
        // Center point X must be at least halfWidth + margin from left, and at most screenWidth - halfWidth - margin from left
        let clampedX = Math.max(halfWidth + 10, Math.min(screenWidth - halfWidth - 10, originalCenterX));

        // Calculate arrow offset (so arrow points to original element even if tooltip is shifted)
        const arrowOffset = originalCenterX - clampedX;

        // Vertical Constraint
        const ESTIMATED_HEIGHT = 310;
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        let placement: 'top' | 'bottom' = 'top';
        let y = rect.top;

        // Prefer top, but flip if not enough space and bottom has more space
        if (spaceAbove < ESTIMATED_HEIGHT && spaceBelow > spaceAbove) {
            placement = 'bottom';
            y = rect.bottom + 12; // Gap below element
        } else {
            y = rect.top - 12; // Gap above element
        }

        return {
            x: clampedX,
            y: y,
            items: allItems,
            title: title,
            placement,
            arrowOffset
        };
    };

    // Consolidated Day Hover Handler
    const handleDayMouseEnter = (arg: { date: Date, el: HTMLElement, jsEvent: MouseEvent }) => {
        if (tooltip?.locked) return; // Don't interrupt if locked

        const data = getTooltipData(arg.date, arg.el);
        if (data) {
            setTooltip({ ...data, locked: false });
        } else {
            setTooltip(null);
        }
    };

    const handleDayMouseLeave = () => {
        if (tooltip?.locked) return; // Don't close if locked
        setTooltip(null);
    };

    const handleDateClick = (arg: any) => {
        const data = getTooltipData(arg.date, arg.dayEl);

        if (data) {
            // Set as locked
            setTooltip({ ...data, locked: true });
        } else {
            // Clicking empty date closes existing locked tooltip
            setTooltip(null);
        }
    };

    // Helper to map bookings to events
    const mapBookingsToEvents = (bookings: any[]) => {
        const tempMap = new Map<string, any>();
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const currentUserId = user?.id;

        bookings.forEach((booking: any) => {
            let color = "#ef4444"; // Red (Booked/Other)
            let type = "Booked";

            const isMyBooking = currentUserId && booking.userID === currentUserId;

            if (booking.status === "setup") {
                color = "#ec4899"; // Pink
                type = "Setup";
            } else if (booking.status === "pending") {
                color = "#f97316"; // Orange
                type = "Pending";
            } else if (isMyBooking) {
                color = "#22c55e"; // Green
                type = "My Booking";
            } else if (booking.status === "approved") {
                color = "#ef4444"; // Red
                type = "Booked";
            }

            // Helper to split multi-day bookings
            const start = new Date(booking.date_start);
            const end = new Date(booking.date_end);
            const current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const key = `${dateStr}-${color}`;

                if (!tempMap.has(key)) {
                    tempMap.set(key, {
                        title: type,
                        start: dateStr,
                        backgroundColor: color,
                        extendedProps: {
                            items: [{
                                facility: booking.facility_name,
                                time: `${booking.time_start} - ${booking.time_end}`,
                                purpose: booking.purpose,
                                type: type,
                                color: color
                            }]
                        }
                    });
                } else {
                    const existing = tempMap.get(key);
                    existing.extendedProps.items.push({
                        facility: booking.facility_name,
                        time: `${booking.time_start} - ${booking.time_end}`,
                        purpose: booking.purpose,
                        type: type,
                        color: color
                    });
                }
                current.setDate(current.getDate() + 1);
            }
        });

        return Array.from(tempMap.values());
    };

    // Update events when rawBookings or selectedFacility changes
    useEffect(() => {
        let filtered = rawBookings;
        if (selectedFacility !== "All") {
            filtered = rawBookings.filter(b => b.facility_name === selectedFacility);
        }
        setEvents(mapBookingsToEvents(filtered));
    }, [rawBookings, selectedFacility]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hostname = window.location.hostname;

                // Fetch All Facilities for Dropdown
                const facRes = await fetch(`http://${hostname}:5000/api/facilities/public`);
                if (facRes.ok) {
                    const facData = await facRes.json();
                    const allFacilities = facData.facilities.map((f: any) => f.facility_name).sort();
                    setFacilities(allFacilities);
                }

                // Fetch Public Bookings
                const bookRes = await fetch(`http://${hostname}:5000/api/bookings/public`);
                if (bookRes.ok) {
                    const bookData = await bookRes.json();
                    setRawBookings(bookData.bookings || []);
                }
            } catch (err) {
                console.error("Failed to load hero data", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="hero w-full grid grid-cols-1 lg:grid-cols-2 gap-1 md:gap-8 lg:gap-8 py-2 md:py-8 lg:py-[60px] px-4 lg:px-8 max-w-[1400px] mx-auto items-center lg:items-start md:min-h-screen lg:min-h-[600px] pt-[10px] md:pt-[100px] lg:pt-[60px] h-auto">
            <div className="hero-left flex flex-col justify-center pl-0 lg:pl-8 order-2 lg:order-1 text-center lg:text-left">
                <div className="hero-left-content max-w-[600px] relative mx-auto lg:mx-0 px-2">
                    <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[3.5rem] leading-tight lg:leading-[1.1] text-primary mb-4 font-black tracking-tight">
                        Simplify Your Event Booking Process
                    </h1>
                    <h3 className="text-base sm:text-lg leading-relaxed text-gray-600 mb-8 font-medium max-w-md mx-auto lg:mx-0">
                        Effortlessly schedule and manage university facilities with our
                        streamlined, real-time booking system.
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <Link href="/client/booking" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto bg-gradient-to-r from-secondary to-blue-700 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300">
                                Book Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="hero-right flex flex-col justify-center items-center md:h-full relative order-1 lg:order-2 w-full">
                {/* Facility Filter */}
                {/* Facility Filter - Custom Dropdown */}
                <div className="w-full flex justify-end mb-2 relative z-20">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 shadow-sm hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                        <Filter size={16} className="text-primary" />
                        <span className="truncate max-w-[150px]">{selectedFacility === "All" ? "All Facilities" : selectedFacility}</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                            <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar overscroll-contain">
                                <button
                                    onClick={() => {
                                        setSelectedFacility("All");
                                        setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors ${selectedFacility === "All" ? 'bg-blue-50 text-primary font-bold' : 'text-gray-600'}`}
                                >
                                    All Facilities
                                    {selectedFacility === "All" && <Check size={16} />}
                                </button>
                                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                {facilities.map((fac, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedFacility(fac);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors ${selectedFacility === fac ? 'bg-blue-50 text-primary font-bold' : 'text-gray-600'}`}
                                    >
                                        <span className="truncate">{fac}</span>
                                        {selectedFacility === fac && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="hero-right-content w-full h-[340px] md:h-[450px] bg-white rounded-[20px] shadow-md relative overflow-hidden mb-1 border border-gray-100">
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
                            top: tooltip.y,
                            left: tooltip.x,
                            transform: tooltip.placement === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                            width: '90vw',
                            maxWidth: '320px'
                        }}
                    >
                        {/* Close Button only if locked */}
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
                                <span className="text-gray-500">📅</span>
                                {tooltip.title}
                            </h4>
                            <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                {tooltip.items.length} Event{tooltip.items.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {/* Group items by type */}
                            {(() => {
                                const groupedItems: Record<string, any[]> = {};
                                const order = ["My Booking", "Booked", "Pending", "Setup"];

                                tooltip.items.forEach((item: any) => {
                                    if (!groupedItems[item.type]) groupedItems[item.type] = [];
                                    groupedItems[item.type].push(item);
                                });

                                return order.map((type) => {
                                    if (!groupedItems[type] || groupedItems[type].length === 0) return null;

                                    const groupColor = groupedItems[type][0].color; // Use color from first item

                                    return (
                                        <div key={type} className="mb-2 last:mb-0">
                                            <h5 className="text-[10px] font-bold uppercase tracking-wider mb-1 px-2 flex items-center gap-1.5" style={{ color: groupColor }}>
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: groupColor }}></div>
                                                {type}
                                            </h5>
                                            <div className="space-y-1">
                                                {groupedItems[type].map((item: any, i: number) => (
                                                    <div key={i} className="text-xs group hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100 ml-1">
                                                        <div className="font-bold text-gray-700 mb-0.5 flex justify-between">
                                                            {item.facility}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                                            <span>🕒 {item.time}</span>
                                                        </div>
                                                        <div className="text-gray-600 leading-snug">
                                                            {item.purpose}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Decorative Arrow */}
                        <div
                            className={`absolute -translate-x-1/2 w-3 h-3 bg-white rotate-45 shadow-sm 
                                ${tooltip.placement === 'bottom'
                                    ? 'top-[-6px] border-t border-l border-gray-100' // Points Up
                                    : 'bottom-[-6px] border-b border-r border-gray-100' // Points Down
                                }`}
                            style={{ left: `calc(50% + ${tooltip.arrowOffset || 0}px)` }}
                        ></div>
                    </div>
                )}

                {/* Legends */}
                <div className="w-full flex flex-wrap justify-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white shadow-sm mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        <span className="text-xs font-semibold text-gray-600">My Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <span className="text-xs font-semibold text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                        <span className="text-xs font-semibold text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm"></div>
                        <span className="text-xs font-semibold text-gray-600">Setup</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
