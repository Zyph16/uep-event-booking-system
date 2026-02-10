"use client";

import Sidebar from "@/components/layout/Sidebar";
import PresidentHeader from "@/components/layout/PresidentHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PresidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (user.role_name !== "UNIVERSITY PRESIDENT" && user.role_name !== "PRESIDENT") {
                // If not president, redirect to landing or appropriate dashboard
                router.push("/");
                return;
            }
            setIsAuthorized(true);
        } catch (e) {
            router.push("/login");
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3c88]"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f5f7fa]">
            {/* Sidebar */}
            <Sidebar
                role="UNIVERSITY PRESIDENT"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <PresidentHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
