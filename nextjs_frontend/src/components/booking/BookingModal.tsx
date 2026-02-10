"use client";

import React, { useState, useEffect } from "react";
import { X, Info, CheckCircle, ChevronDown, Calendar as CalendarIcon, MapPin, Users, Plus, ShieldCheck, AlertTriangle, ArrowLeft, Filter, Check } from "lucide-react";
import Calendar from "@/components/shared/Calendar";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    facility: any;
}

const POLICY_TEXT = `
1. Eligibility to Book
Only authorized university stakeholders, including students, faculty, staff, and officially recognized organizations, may submit booking requests. The university reserves the right to verify eligibility and deny requests that do not meet institutional requirements.

2. Booking Request and Approval
All submitted bookings are considered requests and are not confirmed until officially approved by the designated university authority.
Approval is subject to facility availability, purpose of use, and compliance with university policies.
The university reserves the right to approve, reject, reschedule, or cancel any booking when necessary.

3. Accuracy of Information
Users must ensure that all information provided in the booking form—including event details, date, time, and purpose—is accurate and complete. Any false or misleading information may result in booking rejection or cancellation.

4. Setup and Preparation Notice Policy
Clients are required to inform the university in advance of any setup or preparation activities related to the event.
The setup request must clearly specify:
   - The date(s) of setup or preparation
   - The expected duration, expressed in hours or days
   - The type of setup to be conducted (e.g., stage, sound system, decorations, equipment)
Setup and preparation activities are subject to approval and must not interfere with other scheduled bookings.
Failure to properly declare setup requirements may result in denial of access, delay of setup, or cancellation of the event.

5. Cancellation and Modifications
Any cancellation or modification of an approved booking must be submitted within the prescribed notice period.
Unused bookings without proper cancellation may lead to temporary suspension of booking privileges.
All modifications are subject to re-evaluation and approval.

6. Facility Usage and User Responsibilities
Facilities must be used strictly for the approved purpose.
Clients are responsible for ensuring proper conduct, cleanliness, and order before, during, and after the event.
All equipment and facilities must be returned in their original condition after use.

7. Damage, Loss, and Legal Compensation
Any damage, loss, or destruction of university property incurred before, during, or after the event shall be the full responsibility of the client.
The client agrees to properly and legally compensate the university for all damages, including repair, replacement, and associated costs.
The university reserves the right to assess damages, issue formal claims, and pursue legal remedies when necessary.
Failure to settle damage liabilities may result in administrative sanctions, suspension of booking privileges, or further legal action.

8. Compliance with University Rules and Laws
All events must comply with:
   - University rules and regulations
   - Safety, security, and risk management policies
   - Applicable local and national laws
The university reserves the right to suspend or terminate any event that violates these policies.

9. Data Privacy and System Use
Personal data collected through this system will be used solely for booking processing, communication, and administrative purposes, in accordance with applicable data privacy laws and university policies.
System misuse or unauthorized access may result in disciplinary action.

10. Agreement and Consent
By clicking “Submit Booking”, you confirm that:
   - You have read and understood this Facility Booking Policy and User Agreement
   - You agree to comply with all terms and conditions stated above
   - You accept full responsibility for the booking request and the conducted activity
`;

export default function BookingModal({ isOpen, onClose, facility }: BookingModalProps) {
    // Form State
    const [formData, setFormData] = useState({
        organization: "",
        dateSelections: [] as { date: string; timeStart: string; timeEnd: string }[],
        setupDate: "",
        setupTimeStart: "",
        setupTimeEnd: "",
        purpose: "",
        agreedToPolicy: false
    });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [hasReadPolicy, setHasReadPolicy] = useState(false);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // NEW: Calendar Visualization State
    const [events, setEvents] = useState<any[]>([]);
    const [rawBookings, setRawBookings] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [selectedFacility, setSelectedFacility] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Initialize selected facility when modal opens
    useEffect(() => {
        if (facility && facility.facility_name) {
            setSelectedFacility(facility.facility_name);
        }
    }, [facility]);

    // Fetch Public Data (Facilities & Bookings)
    useEffect(() => {
        if (!isOpen) return;

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
                console.error("Failed to load calendar data", err);
            }
        };

        fetchData();
    }, [isOpen]);

    // Map Bookings to Events
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

            // Split multi-day bookings
            const start = new Date(booking.date_start);
            const end = new Date(booking.date_end);
            const current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const key = `${dateStr}-${color}`; // Unique key per date+status

                // We only need one dot per type per day, so check if key exists
                if (!tempMap.has(key)) {
                    tempMap.set(key, {
                        title: type,
                        start: dateStr,
                        backgroundColor: color,
                        display: 'background', // Or just standard event to be rendered as dot via CSS
                        classNames: ['event-dot'], // Custom class for styling if needed
                        extendedProps: { type }
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


    // Handle Calendar Selection
    const handleDateSelect = (arg: any) => {
        const dateStr = arg.dateStr;
        setFormData(prev => {
            const exists = prev.dateSelections.find(d => d.date === dateStr);
            let newSelections;
            if (exists) {
                newSelections = prev.dateSelections.filter(d => d.date !== dateStr);
            } else {
                newSelections = [...prev.dateSelections, {
                    date: dateStr,
                    timeStart: "08:00",
                    timeEnd: "17:00"
                }].sort((a, b) => a.date.localeCompare(b.date));
            }

            // Auto-set setup date (logic remains same)
            let newSetupDate = prev.setupDate;
            if (newSelections.length > 0) {
                const earliest = newSelections[0].date;
                const d = new Date(earliest);
                d.setUTCDate(d.getUTCDate() - 1);
                newSetupDate = d.toISOString().split('T')[0];
            } else {
                newSetupDate = "";
            }

            return { ...prev, dateSelections: newSelections, setupDate: newSetupDate };
        });
    };

    // Helper to update specific time
    const updateTime = (date: string, field: 'timeStart' | 'timeEnd', value: string) => {
        setFormData(prev => ({
            ...prev,
            dateSelections: prev.dateSelections.map(d =>
                d.date === date ? { ...d, [field]: value } : d
            )
        }));
    };

    // Policy Confirmation
    const handlePolicyConfirm = () => {
        setHasReadPolicy(true);
        setFormData(prev => ({ ...prev, agreedToPolicy: true }));
        setIsPolicyModalOpen(false);
    };

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.dateSelections.length === 0) {
            setError("Please select at least one date.");
            return;
        }

        setIsSubmitting(true);

        try {
            const userStr = localStorage.getItem("user");
            const tokenStr = localStorage.getItem("token");

            if (!userStr) throw new Error("You must be logged in to book.");

            const user = JSON.parse(userStr);
            const token = tokenStr || user.token || user.accessToken;

            // Sort selections by date
            const sortedSelections = [...formData.dateSelections].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Construct Schedule Array
            const schedule = sortedSelections.map(s => ({
                date: s.date,
                time_start: s.timeStart,
                time_end: s.timeEnd
            }));

            // Main Booking Payload
            // date_start is the first date, date_end is the last date
            // time_start/end can be from the first slot or overall range (backend logic usually prefers overall or specific slot)
            // Here we send the first slot's time as the "primary" time, but the schedule array holds the truth.
            const payload = {
                facilityID: facility.facilityID,
                organization: formData.organization,
                purpose: formData.purpose,
                date_requested: new Date().toISOString().split('T')[0],
                date_start: sortedSelections[0].date,
                date_end: sortedSelections[sortedSelections.length - 1].date,
                time_start: sortedSelections[0].timeStart,
                time_end: sortedSelections[0].timeEnd,
                setup_date_start: formData.setupDate || null,
                setup_date_end: formData.setupDate || null,
                setup_time_start: formData.setupTimeStart || null,
                setup_time_end: formData.setupTimeEnd || null,
                schedule: schedule // Add the schedule array
            };

            const hostname = window.location.hostname;
            const res = await fetch(`http://${hostname}:5000/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to submit booking.");
            }

            alert(`Booking Request Submitted Successfully!`);
            onClose();
            // Reset form
            setFormData({
                organization: "",
                dateSelections: [],
                setupDate: "",
                setupTimeStart: "",
                setupTimeEnd: "",
                purpose: "",
                agreedToPolicy: false
            });
            setHasReadPolicy(false);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // CORRECTED: Early return AFTER hooks
    if (!isOpen || !facility) return null;

    // Image handling
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const imageUrl = facility.imagepath
        ? (facility.imagepath.startsWith('http')
            ? facility.imagepath
            : `http://${hostname}:5000${facility.imagepath.startsWith('/') ? '' : '/'}${facility.imagepath}`)
        : null;

    // Validation Warnings
    const getTimeWarnings = () => {
        const warnings: string[] = [];
        let hasLateTime = false;
        let hasOvertime = false;

        formData.dateSelections.forEach(s => {
            if (s.timeEnd > "23:00") hasLateTime = true;

            const start = new Date(`1970-01-01T${s.timeStart}`);
            const end = new Date(`1970-01-01T${s.timeEnd}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (diff > 8) hasOvertime = true;
        });

        if (hasLateTime) warnings.push("Note: University facilities are available for booking only until 11:00 PM.");
        if (hasOvertime) warnings.push("Notice: This booking exceeds 8 hours. Additional utility charges will apply.");

        return warnings;
    };

    const timeWarnings = getTimeWarnings();

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
            {/* ... existing code ... */}
            <div className="bg-white w-full max-w-[1200px] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* ... existing code ... */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT PANEL: FORM */}
                    <div className="flex-1 overflow-y-auto p-8 border-r border-gray-100 custom-scrollbar">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                title="Go Back"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-[#2d2d5f]">Booking Request</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* ... existing code ... */}



                            {/* Section 1: Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Group / Organization</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter organization name"
                                        value={formData.organization}
                                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Facility</label>
                                    <input
                                        type="text"
                                        value={facility.facility_name}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-bold cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Date & Time */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-[#2d2d5f] flex items-center gap-2">
                                    <CalendarIcon size={18} /> Event Schedule
                                </h3>

                                {/* Date Selection Trigger */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <label className="block text-xs font-bold text-blue-800 uppercase mb-3">Selected Dates</label>

                                    <button
                                        type="button"
                                        onClick={() => setIsCalendarOpen(true)}
                                        className="w-full bg-white border border-blue-200 text-blue-600 hover:text-blue-800 hover:border-blue-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all mb-4"
                                    >
                                        <CalendarIcon size={18} />
                                        {formData.dateSelections.length > 0 ? "Modify Selected Dates" : "Open Calendar to Select Dates"}
                                    </button>

                                    {/* Date List & Time Inputs */}
                                    {formData.dateSelections.length > 0 && (
                                        <div className="space-y-3">
                                            {formData.dateSelections.map((selection, index) => (
                                                <div key={selection.date} className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col md:flex-row gap-3 items-center animate-in slide-in-from-left-2 duration-300">
                                                    <div className="flex-1 w-full md:w-auto flex items-center gap-3">
                                                        <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded text-sm text-center min-w-[100px]">
                                                            {selection.date}
                                                        </div>
                                                        <span className="text-xs text-gray-500 hidden md:inline">
                                                            {new Date(selection.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                                        <div className="flex flex-col">
                                                            <input
                                                                type="time"
                                                                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-900"
                                                                value={selection.timeStart}
                                                                onChange={(e) => updateTime(selection.date, 'timeStart', e.target.value)}
                                                            />
                                                        </div>
                                                        <span className="text-gray-300">-</span>
                                                        <div className="flex flex-col">
                                                            <input
                                                                type="time"
                                                                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-900"
                                                                value={selection.timeEnd}
                                                                onChange={(e) => updateTime(selection.date, 'timeEnd', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDateSelect({ dateStr: selection.date })}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Warnings Display */}
                                {timeWarnings.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2 mt-4">
                                        {timeWarnings.map((w, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-amber-800 font-medium">
                                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                                <span>{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Setup Date (Remaining Inputs...) */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Setup Date</label>
                                        <input type="date" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-gray-900" value={formData.setupDate} onChange={e => setFormData({ ...formData, setupDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Setup Time</label>
                                        <div className="flex gap-2">
                                            <input type="time" className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-gray-900" value={formData.setupTimeStart} onChange={e => setFormData({ ...formData, setupTimeStart: e.target.value })} />
                                            <input type="time" className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-gray-900" value={formData.setupTimeEnd} onChange={e => setFormData({ ...formData, setupTimeEnd: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3">
                                    <Info size={18} className="text-orange-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-orange-800 leading-relaxed"><strong>Wednesday Notice:</strong> Vehicles are strictly not allowed inside the campus on Wednesdays.</p>
                                </div>
                            </div>

                            {/* Section 3: Purpose */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">

                                <label className="block text-sm font-bold text-gray-700 mb-1">Purpose of Event</label>
                                <textarea
                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                                    placeholder="Describe the purpose..."
                                    value={formData.purpose}
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            {/* Policy Section (UPDATED) */}
                            <div className="pt-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center pt-1">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={formData.agreedToPolicy}
                                            disabled={!hasReadPolicy}
                                            onChange={(e) => setFormData({ ...formData, agreedToPolicy: e.target.checked })}
                                        />
                                        <div className={`w-5 h-5 border-2 rounded transition-colors ${!hasReadPolicy ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 peer-checked:bg-primary peer-checked:border-primary'}`}></div>
                                        <CheckCircle size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none mt-1.5 ml-0.5" />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        I confirm I have read and agree to the
                                        <button
                                            type="button"
                                            onClick={() => setIsPolicyModalOpen(true)}
                                            className="text-primary font-bold underline ml-1 hover:text-blue-800 focus:outline-none"
                                        >
                                            Policy and Terms
                                        </button>.
                                    </span>
                                </label>
                                {!hasReadPolicy && (
                                    <p className="text-xs text-red-500 mt-2 ml-8">
                                        * You must read the Policy and Terms before agreeing.
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                {error && <div className="text-red-500 text-sm mb-3 font-medium bg-red-50 p-2 rounded">{error}</div>}
                                <button
                                    type="submit"
                                    disabled={!formData.agreedToPolicy || isSubmitting}
                                    className="w-full py-3.5 bg-[#1f3c88] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#162a60] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT PANEL: INFO ONLY */}
                    <div className="w-[350px] bg-gray-50 p-6 flex flex-col gap-6 overflow-y-auto border-l border-gray-200 hidden lg:flex">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-48 bg-gray-200 relative">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={facility.facility_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="text-white font-bold text-lg truncate">{facility.facility_name}</div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> <span>{facility.location || 'Campus'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-primary" /> <span>{facility.capacity} pax</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
                                        <span>Status</span>
                                        <span className="text-green-600">{facility.status}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between items-center text-[#1f3c88] font-bold">
                                        <span>Total Estimate:</span>
                                        <span className="text-xl">PHP {
                                            ((facility.price || 0) * (formData.dateSelections.length || 0)).toFixed(2)
                                        }</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right mt-1">Based on {formData.dateSelections.length} days selected</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* NESTED CALENDAR MODAL */}
                {
                    isCalendarOpen && (
                        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white w-full max-w-2xl h-[700px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                                {/* Header with Filter */}
                                <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-100 gap-4 bg-white">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-[#2d2d5f]">Select Dates</h3>
                                        <span className="text-gray-300">|</span>
                                        {/* Facility Filter */}
                                        <div className="relative z-20">
                                            <button
                                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-all active:scale-95"
                                            >
                                                <Filter size={14} className="text-primary" />
                                                <span className="truncate max-w-[150px]">{selectedFacility === "All" ? "All Facilities" : selectedFacility}</span>
                                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {isFilterOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                                    <div className="absolute top-10 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar overscroll-contain">
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
                                    </div>
                                    <button onClick={() => setIsCalendarOpen(false)} className="px-5 py-2 bg-[#1f3c88] text-white rounded-lg text-sm font-bold hover:bg-[#162a60] shadow-sm">
                                        Done
                                    </button>
                                </div>

                                <div className="flex-1 p-4 overflow-hidden relative">
                                    <Calendar
                                        events={events}
                                        selectable={true}
                                        onDateClick={handleDateSelect}
                                        selectedDates={formData.dateSelections.map(d => d.date)}
                                    />
                                </div>

                                {/* Legend & Footer */}
                                <div className="bg-gray-50 border-t border-gray-100 p-3">
                                    <div className="flex flex-wrap justify-center gap-4 mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <span className="text-[10px] font-semibold text-gray-600">My Bookings</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span className="text-[10px] font-semibold text-gray-600">Booked</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                            <span className="text-[10px] font-semibold text-gray-600">Pending</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                                            <span className="text-[10px] font-semibold text-gray-600">Setup</span>
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-gray-400">
                                        Click dates to select or deselect.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* NESTED POLICY MODAL */}
                {
                    isPolicyModalOpen && (
                        <div className="absolute inset-0 z-[1100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white w-full max-w-3xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                {/* Policy Header */}
                                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#f8fafc]">
                                    <h3 className="text-lg font-bold text-[#2d2d5f] flex items-center gap-2">
                                        <ShieldCheck className="text-primary" /> Facility Booking Policy
                                    </h3>
                                    <button onClick={() => setIsPolicyModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Policy Content */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50">
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                        {POLICY_TEXT}
                                    </div>
                                </div>

                                {/* Policy Footer */}
                                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsPolicyModalOpen(false)}
                                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handlePolicyConfirm}
                                        className="px-6 py-2.5 bg-[#1f3c88] text-white font-bold rounded-lg text-sm hover:bg-[#162a60] shadow-md hover:shadow-lg transition-all"
                                    >
                                        I Have Read and Understand
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

            </div >
        </div >
    );
}
