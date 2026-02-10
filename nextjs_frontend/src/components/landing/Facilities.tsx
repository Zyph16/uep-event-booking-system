"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Types
interface Facility {
    FacilityID: number;
    FacilityName: string;
    location: string;
    capacity: number;
    image_path: string;
    status?: string;
}

const API_BASE_URL = "/uep-event-booking/uepeventorg_backend/public";

// Mock Data (Fallback)
const MOCK_FACILITIES: Facility[] = [
    {
        FacilityID: 1,
        FacilityName: "Main Auditorium",
        location: "Building A",
        capacity: 500,
        image_path: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&w=800&q=80",
        status: "available",
    },
    {
        FacilityID: 2,
        FacilityName: "Conference Hall",
        location: "Building B",
        capacity: 100,
        image_path: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&w=800&q=80",
        status: "available",
    },
    {
        FacilityID: 3,
        FacilityName: "IT Lab 1",
        location: "Tech Center",
        capacity: 40,
        image_path: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&w=800&q=80",
        status: "available",
    },
    {
        FacilityID: 4,
        FacilityName: "Gymnasium",
        location: "Sports Complex",
        capacity: 1000,
        image_path: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=800&q=80",
        status: "available",
    },
];

export default function Facilities() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Swipe State
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                // Dynamically get the hostname (localhost or IP) to ensure it works on mobile
                const hostname = window.location.hostname;
                const response = await fetch(`http://${hostname}:5000/api/facilities/public`);
                if (!response.ok) throw new Error("Failed to fetch facilities");

                const data = await response.json();

                // Map backend data to frontend interface
                const mappedFacilities = data.facilities.map((fac: any) => {
                    // Use the backend provided imagepath filename (e.g., "1.jpg", "5.jpg")
                    // If backend sends just "1.jpg", we map it to "/facilities/1.jpg"
                    let relativePath = fac.imagepath || "1.jpg";

                    // Cleanup path if needed (e.g. remove leading slashes if we want to force our path)
                    // But if it starts with http, keep it.
                    let imagePath;

                    if (relativePath.startsWith("http")) {
                        imagePath = relativePath;
                    } else {
                        // Strip any potential leading paths if we want to force local facilities folder
                        // relativePath = relativePath.split('/').pop(); 
                        // Actually, let's just use it as is if it looks like a filename.
                        // If it starts with /, assume it's absolute. If not, prepend /facilities/
                        if (relativePath.startsWith("/")) {
                            // If backend sends /uploads/..., we might need to handle that.
                            // But user specifically said "use public/facilities". 
                            // Let's assume the backend 'imagepath' field corresponds to the filenames in that folder.
                            // For safety, let's extract the basename.
                            const filename = relativePath.split(/[/\\]/).pop();
                            imagePath = `/facilities/${filename}`;
                        } else {
                            imagePath = `/facilities/${relativePath}`;
                        }
                    }

                    return {
                        FacilityID: fac.facilityID,
                        FacilityName: fac.facility_name,
                        location: fac.location,
                        capacity: fac.capacity,
                        image_path: imagePath,
                        status: fac.status
                    };
                });

                setFacilities(mappedFacilities);
            } catch (error) {
                console.error("Error loading facilities:", error);
                // Fallback to mock data on error so the section doesn't disappear
                setFacilities(MOCK_FACILITIES);
            }
        };

        fetchFacilities();
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % facilities.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + facilities.length) % facilities.length);
    };

    if (facilities.length === 0) {
        // If absolutely no data (fetch failed AND no mock data), render nothing.
        // But now we have mock data, so this shouldn't happen unless we want it to.
        return null;
    }

    // Calculate visible slides indices
    const getSlideStyle = (index: number) => {
        const total = facilities.length;
        let diff = (index - currentIndex + total + total) % total;
        if (diff > total / 2) diff -= total;

        const isActive = diff === 0;

        let transform = "translateX(0) scale(0.8) opacity(0)";
        let zIndex = 0;
        let opacity = 0;

        if (isActive) {
            transform = "translateX(0) scale(1)";
            zIndex = 10;
            opacity = 1;
        } else if (diff === -1) {
            // Left card 
            const translate = isMobile ? "-15%" : "-60%";
            transform = `translateX(${translate}) scale(0.85)`;
            zIndex = 5;
            opacity = 0.5;
        } else if (diff === 1) {
            // Right card
            const translate = isMobile ? "15%" : "60%";
            transform = `translateX(${translate}) scale(0.85)`;
            zIndex = 5;
            opacity = 0.5;
        }

        // Hide others completely to prevent layout issues

        return { transform, zIndex, opacity };
    };

    // Swipe Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }

        // Reset
        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <section className="py-[40px] md:py-[60px] pb-[60px] md:pb-[100px] flex flex-col items-center relative overflow-hidden min-h-[550px] md:min-h-[750px]" id="facilities">
            <div className="text-center mb-2 md:mb-6 z-10 relative px-4">
                <h2 className="text-primary text-2xl md:text-[2.5rem] font-bold m-0 text-shadow-sm">Our Facilities</h2>
                <p className="text-text-muted text-sm md:text-lg max-w-[700px] mt-2 md:mt-4">
                    Explore our state-of-the-art venues designed to host everything from
                    intimate meetings to grand events.
                </p>
            </div>

            {/* Slider Container */}
            <div
                className="relative w-full max-w-[1200px] h-[400px] md:h-[500px] flex justify-center items-center mt-0 md:mt-2 touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {facilities.map((fac, index) => {
                    const style = getSlideStyle(index);

                    return (
                        <div
                            key={fac.FacilityID}
                            className="absolute transition-all duration-500 ease-in-out flex justify-center items-center"
                            style={{
                                transform: style.transform,
                                zIndex: style.zIndex,
                                opacity: style.opacity,
                                width: "100%", // Responsive container width
                                maxWidth: "600px", // Max width for desktop
                                display: "flex",
                                justifyContent: "center",
                                pointerEvents: style.opacity > 0 ? "auto" : "none"
                            }}
                        >
                            <div className="relative w-[90vw] md:w-full h-[320px] md:h-[400px] rounded-[24px] md:rounded-[55px] overflow-hidden shadow-2xl group cursor-pointer bg-white">
                                <Image
                                    src={fac.image_path}
                                    alt={fac.FacilityName}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 md:p-8 pt-24 md:pt-32 text-white flex flex-col items-start">
                                    <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 shadow-black/50 drop-shadow-md">{fac.FacilityName}</h3>
                                    <p className="mb-1 opacity-90 text-xs md:text-sm drop-shadow-sm">📍 {fac.location}</p>
                                    <p className="mb-3 md:mb-4 opacity-90 text-xs md:text-sm drop-shadow-sm">👥 Capacity: {fac.capacity}</p>

                                    <Link href={`/client/booking?facility=${fac.FacilityID}`}>
                                        <button className="bg-secondary text-white px-5 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-lg font-bold shadow-lg hover:bg-secondary-dark transition-colors">
                                            Book Now
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex gap-8  z-20">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
                    aria-label="Previous Slide"
                >
                    <ArrowLeft size={24} />
                </button>

                {/* Indicators */}
                <div className="flex gap-3 items-center">
                    {facilities.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-primary' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
                    aria-label="Next Slide"
                >
                    <ArrowRight size={24} />
                </button>
            </div>
        </section>
    );
}
