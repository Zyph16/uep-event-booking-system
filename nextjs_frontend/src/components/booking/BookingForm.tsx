"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, Info, ArrowRight, X, MapPin, CheckCircle } from "lucide-react";
import Calendar from "@/components/shared/Calendar";

interface BookingFormProps {
    facility: any;
    onCancel: () => void;
}

export default function BookingForm({ facility, onCancel }: BookingFormProps) {
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        organization: "",
        dateRequested: "",
        timeStart: "",
        timeEnd: "",
        setupDate: "",
        setupTimeStart: "",
        setupTimeEnd: "",
        purpose: "",
        agreedToPolicy: false
    });

    if (!facility) return null;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleDateSelect = (arg: any) => {
        // arg.startStr is YYYY-MM-DD
        // arg.dateStr is for dateClick
        const date = arg.startStr || arg.dateStr;
        setFormData(prev => ({ ...prev, dateRequested: date }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full sticky top-4">
            {/* Header */}
            <div className="bg-primary p-6 text-white flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold leading-tight mb-1">Book {facility.name}</h2>
                    <div className="text-blue-100 text-sm flex gap-2 items-center">
                        <MapPinIcon size={14} /> {facility.location}
                        <span>•</span>
                        <UsersIcon size={14} /> {facility.capacity} pax
                    </div>
                </div>
                <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Form Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Step 1: Organization & Dates */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Organization / Group</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. Computer Science Student Council"
                                value={formData.organization}
                                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                                Select Event Date {formData.dateRequested && <span className="text-primary normal-case">- {formData.dateRequested}</span>}
                            </label>
                            <div className="border rounded-xl overflow-hidden shadow-sm h-[350px]">
                                {/* 
                                Calendar Component:
                                - events: array of existing bookings (mocked empty for now)
                                - selectable: allows interactions
                                - onDateClick: handles single click
                             */}
                                <Calendar
                                    events={[]}
                                    selectable={true}
                                    onDateClick={handleDateSelect}
                                />
                            </div>
                            <p className="text-xs text-gray-500 italic mt-1 text-center">
                                * Click a date to select it.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                    value={formData.timeStart}
                                    onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                    value={formData.timeEnd}
                                    onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Details & Review */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800 flex gap-2">
                            <Info size={16} className="shrink-0" />
                            <p>Vehicle entry is restricted on Wednesdays. Please ensure you have approval if your setup requires vehicle access.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Purpose</label>
                            <textarea
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Describe the nature of your event..."
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer sr-only" onChange={(e) => setFormData({ ...formData, agreedToPolicy: e.target.checked })} />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                                    <CheckCircle size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                    I confirm I have read the <span className="text-primary font-bold underline">Policy and Guidelines</span>.
                                </span>
                            </label>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                {step > 1 ? (
                    <button onClick={handleBack} className="text-gray-500 font-bold text-sm hover:text-gray-800 px-4 py-2">
                        Back
                    </button>
                ) : (
                    <div className="text-xs text-gray-400">Step {step} of 2</div>
                )}

                {step < 2 ? (
                    <button
                        onClick={handleNext}
                        className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        className="bg-green-600 text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!formData.agreedToPolicy}
                    >
                        Submit Request
                    </button>
                )}
            </div>
        </div>
    );
}

// Icons helper
function MapPinIcon({ size }: { size: number }) { return <MapPin size={size} />; }
function UsersIcon({ size }: { size: number }) { return <Users size={size} />; }
