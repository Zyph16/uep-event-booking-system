"use client";

import { Bell, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface PresidentHeaderProps {
    onMenuClick?: () => void;
}

export default function PresidentHeader({ onMenuClick }: PresidentHeaderProps) {
    const [notificationCount, setNotificationCount] = useState(0);

    // Mock notification fetching or integrate with backend later
    useEffect(() => {
        // Placeholder for real logic
        setNotificationCount(0);
    }, []);

    return (
        <header className="h-[70px] bg-[#0d2b6b] text-white flex items-center justify-between px-4 md:px-8 border-b-3 border-[#1f3c88] sticky top-0 z-[900]">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg md:text-2xl font-bold tracking-wide truncate">
                    <span className="hidden md:inline">University of Eastern Philippines</span>
                    <span className="md:hidden">UEP Event System</span>
                </h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative cursor-pointer group">
                    <Bell size={22} className="text-white/80 group-hover:text-white transition-colors" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#ff4757] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0d2b6b]">
                            {notificationCount}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}
