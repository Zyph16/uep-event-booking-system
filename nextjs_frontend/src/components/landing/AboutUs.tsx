"use client";

import React from "react";
import { Zap, Users, ShieldCheck } from "lucide-react"; // Using lucide-react for icons replacing material symbols

export default function AboutUs() {
    return (
        <section className="py-[40px] md:py-[60px] px-4 md:px-8 bg-bg-body flex flex-col items-center" id="about-us">
            <div className="text-center w-full md:w-4/5 mb-[20px] max-w-[1350px]">
                <h2 className="text-primary text-2xl md:text-[2rem] font-bold mb-3 md:mb-4">About Us</h2>
                <p className="text-text-muted text-sm md:text-lg max-w-[800px] mx-auto">
                    Simplifying space reservation for students and staff. Replace manual
                    paperwork with a faster, digital workflow.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-4 md:mt-8 w-full max-w-[1400px]">
                {/* Card 1 */}
                <div className="w-full max-w-[350px] min-h-[280px] md:min-h-[300px] bg-white rounded-2xl shadow-lg p-5 md:p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-xl">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-primary">
                        <Zap size={28} className="md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">What We Offer</h3>
                    <ul className="text-text-muted space-y-1.5 md:space-y-2 text-left w-full pl-4 list-disc text-sm md:text-base">
                        <li>Online booking for rooms & venues</li>
                        <li>Real-time availability checking</li>
                        <li>Automated notifications</li>
                        <li>Conflict-free scheduling</li>
                    </ul>
                </div>

                {/* Card 2 (Highlight) */}
                <div className="w-full max-w-[350px] min-h-[280px] md:min-h-[300px] bg-primary text-white rounded-2xl shadow-lg p-5 md:p-8 flex flex-col items-center text-center transform md:scale-105 z-10 hover:shadow-2xl transition-transform hover:-translate-y-2 border-4 border-white/20">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 md:mb-6 text-white">
                        <Users size={28} className="md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Who Can Use It?</h3>
                    <p className="opacity-90 leading-relaxed text-sm md:text-base">
                        Designed for students, faculty, staff, and external clients who need
                        to book university spaces for classes, events, meetings, or
                        activities.
                    </p>
                </div>

                {/* Card 3 */}
                <div className="w-full max-w-[350px] min-h-[280px] md:min-h-[300px] bg-white rounded-2xl shadow-lg p-5 md:p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-xl">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-primary">
                        <ShieldCheck size={28} className="md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">Benefits</h3>
                    <ul className="text-text-muted space-y-1.5 md:space-y-2 text-left w-full pl-4 list-disc text-sm md:text-base">
                        <li>Eliminate manual paperwork</li>
                        <li>Speed up approval processes</li>
                        <li>Ensure fair usage of facilities</li>
                        <li>Better coordination across dep&apos;ts</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
