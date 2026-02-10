"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Calendar, UserCircle } from "lucide-react";

export default function AdminHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <div className="header w-full h-[80px] bg-gradient-to-br from-[#1f3c88] to-[#0d2b6b] shadow-md sticky top-0 z-[1000] flex items-center">
            <div className="navs w-full max-w-[1400px] mx-auto flex justify-between items-center px-4 md:px-8 relative">

                {/* Logo */}
                <div className="nav-left flex items-center text-text-main">
                    <h1 className="text-[2rem] font-bold text-white m-0 p-0">UEP</h1>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-3xl">menu</span>
                </button>

                {/* Desktop Nav - Admin Links */}
                <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link
                        href="/admin/dashboard"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/users"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Manage Users
                    </Link>
                    <Link
                        href="/admin/facilities"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Manage Facilities
                    </Link>
                </div>

                {/* Right Profile */}
                <div className="nav-right flex items-center relative gap-5">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                                <span className="font-bold text-lg">
                                    {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={20} />}
                                </span>
                            </div>
                            <span className="font-medium hidden sm:block">{user?.username || 'Admin'}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100">
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                    <p className="text-sm font-bold text-gray-800 truncate">{user?.username}</p>
                                    <p className="text-xs text-blue-600 font-medium capitalize">{user?.role_name || 'Administrator'}</p>
                                </div>

                                <div className="py-1">
                                    <Link
                                        href="/client/profile"
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <UserCircle size={16} className="text-gray-400" /> Profile
                                    </Link>
                                    <Link
                                        href="/client/my-bookings"
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Calendar size={16} className="text-gray-400" /> My Bookings
                                    </Link>
                                </div>

                                <div className="border-t border-gray-100 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-[80px] left-0 w-full bg-[#0d2b6b] p-4 flex flex-col gap-2 md:hidden shadow-xl border-t border-white/10">
                    <Link href="/admin/dashboard" className="text-white py-3 px-4 hover:bg-white/10 rounded">Dashboard</Link>
                    <Link href="/admin/users" className="text-white py-3 px-4 hover:bg-white/10 rounded">Manage Users</Link>
                    <Link href="/admin/facilities" className="text-white py-3 px-4 hover:bg-white/10 rounded">Manage Facilities</Link>
                </div>
            )}
        </div>
    );
}
