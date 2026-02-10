"use client";

import Sidebar from "@/components/layout/Sidebar";
import PMHeader from "@/components/layout/PMHeader";
import { useState } from "react";

export default function PMLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f5f7fa]">
            {/* Sidebar */}
            <Sidebar
                role="PROJECT MANAGER"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <PMHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
