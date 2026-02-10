"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FileBarChart,
    UserCircle,
    LogOut,
    User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
    role: "ADMIN" | "PROJECT MANAGER" | "UNIVERSITY PRESIDENT";
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Fetch latest personal info to ensure name is up-to-date
                if (token) {
                    const hostname = window.location.hostname;
                    fetch(`http://${hostname}:5000/api/personalinfo/me`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.personalinfo) {
                                setUser((prev: any) => ({
                                    ...prev,
                                    // Merge formatted name fields if they differ from localStorage
                                    first_name: data.personalinfo.fname,
                                    last_name: data.personalinfo.lname,
                                    middle_name: data.personalinfo.mname || null
                                }));
                            }
                        })
                        .catch(err => console.error("Sidebar user fetch error:", err));
                }

            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    let menuItems = [];

    if (role === "PROJECT MANAGER") {
        menuItems = [
            { name: "Dashboard", href: "/pm/dashboard", icon: LayoutDashboard },
            { name: "Bookings", href: "/pm/bookings", icon: BookOpen },
            { name: "Reports", href: "/pm/reports", icon: FileBarChart },
            { name: "Profile", href: "/pm/profile", icon: UserCircle },
        ];
    } else if (role === "UNIVERSITY PRESIDENT") {
        menuItems = [
            { name: "Dashboard", href: "/president/dashboard", icon: LayoutDashboard },
            { name: "Statistics", href: "/president/statistics", icon: FileBarChart },
            { name: "Bookings", href: "/president/bookings", icon: BookOpen },
            { name: "Reports", href: "/president/reports", icon: FileBarChart },
            { name: "Profile", href: "/president/profile", icon: UserCircle },
        ];
    } else {
        menuItems = [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { name: "Manage Users", href: "/admin/users", icon: UserCircle },
            { name: "Manage Facilities", href: "/admin/facilities", icon: BookOpen },
        ];
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[998] md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[280px] bg-[#1f3c88] text-white flex flex-col h-screen fixed md:sticky top-0 
                flex-shrink-0 shadow-xl overflow-hidden transition-transform duration-300 z-[999]
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* User Profile Section */}
                <div className="p-8 text-center bg-[#0d2b6b]/30">
                    <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white/20">
                        <UserIcon size={40} className="text-white/80" />
                    </div>
                    <h3 className="font-bold text-lg truncate leading-tight mb-1">
                        {user ? (() => {
                            const fname = user.first_name || user.fname || '';
                            const lname = user.last_name || user.lname || '';
                            const mname = user.middle_name || user.mname || '';
                            const middleInitial = mname ? mname[0] + '.' : '';
                            const fullName = `${fname} ${middleInitial} ${lname}`.trim();
                            return fullName || user.username;
                        })() : "Juan Dela Cruz"}
                    </h3>
                    <p className="text-sm text-white/60 font-medium">
                        {user?.role_name || (role === "PROJECT MANAGER" ? "Project Manager" : role === "UNIVERSITY PRESIDENT" ? "University President" : "Admin")}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => onClose && onClose()} // Close sidebar on nav click (mobile)
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? "bg-white/15 text-white font-semibold shadow-inner"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} className={`${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout at bottom */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold text-sm uppercase tracking-wider">Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
