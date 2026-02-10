"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Calendar, UserCircle, LayoutDashboard } from "lucide-react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Check for token and user in localStorage
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            setIsLoggedIn(true);
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
        setIsProfileDropdownOpen(false);
        router.push("/login");
    };

    return (
        <div className="header w-full h-[80px] bg-gradient-to-br from-[#1f3c88] to-[#0d2b6b] shadow-md sticky top-0 z-[1000] flex items-center">
            <div className="navs w-full max-w-[1400px] mx-auto flex justify-between items-center px-0 relative">
                <div className="nav-left flex items-center text-text-main pl-4 md:pl-8 gap-3">
                    <button
                        className="mobile-menu-toggle block md:hidden z-50 relative"
                        id="mobile-menu-toggle"
                        aria-label="Toggle navigation"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "32px", color: "white" }}
                        >
                            {isMobileMenuOpen ? "close" : "menu"}
                        </span>
                    </button>
                    <h1 className="text-[2rem] font-bold text-white m-0 p-0">UEP</h1>
                </div>

                <div className="nav-center hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link
                        href="/"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Home
                    </Link>
                    <Link
                        href="/#facilities"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Facilities
                    </Link>
                    <Link
                        href="/#about-us"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        About
                    </Link>
                    <Link
                        href="/client/booking"
                        className="text-white/85 text-base font-medium px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                        Booking
                    </Link>
                </div>

                <div className="nav-right flex items-center relative ml-auto pr-4 md:pr-8">
                    <div className="profile-container relative flex items-center gap-5">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
                                >
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                                        {/* Placeholder Avatar or Initials */}
                                        <span className="font-bold text-sm md:text-lg">
                                            {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={18} />}
                                        </span>
                                    </div>
                                    <span className="font-medium hidden sm:block text-sm md:text-base">{user?.username || 'User'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-700 truncate">{user?.username}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user?.role_name || user?.roleName || 'User'}</p>
                                        </div>

                                        <div className="border-b border-gray-100">
                                            {(user?.role_name === "ADMIN" || user?.roleName === "ADMIN") && (
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-50 flex items-center gap-2"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <Settings size={16} />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            {(user?.role_name === "PROJECT MANAGER" || user?.roleName === "PROJECT MANAGER" || user?.role_name === "PROJECT_MANAGER") && (
                                                <Link
                                                    href="/pm/dashboard"
                                                    className="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-50 flex items-center gap-2"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <LayoutDashboard size={16} />
                                                    PM Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                href="/client/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            >
                                                <UserCircle size={16} />
                                                Profile
                                            </Link>
                                            <Link
                                                href="/client/my-bookings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            >
                                                <Calendar size={16} />
                                                My Bookings
                                            </Link>
                                            <Link
                                                href="/client/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            >
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="text-white font-medium bg-secondary px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:filter hover:brightness-110 shadow-md transition-all">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMobileMenuOpen(false)} />

                {/* Mobile Menu Drawer */}
                <div className={`fixed top-0 left-0 w-[70%] max-w-[300px] h-full bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="p-6 h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#1f3c88]">UEP Events</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Link
                                href="/"
                                className="text-gray-700 text-lg font-semibold px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-[#1f3c88] transition-colors flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined">home</span>
                                Home
                            </Link>
                            <Link
                                href="/#facilities"
                                className="text-gray-700 text-lg font-semibold px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-[#1f3c88] transition-colors flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined">apartment</span>
                                Facilities
                            </Link>
                            <Link
                                href="/#about-us"
                                className="text-gray-700 text-lg font-semibold px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-[#1f3c88] transition-colors flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined">info</span>
                                About
                            </Link>
                            <Link
                                href="/client/booking"
                                className="text-gray-700 text-lg font-semibold px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-[#1f3c88] transition-colors flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined">calendar_month</span>
                                Booking
                            </Link>
                        </div>

                        <div className="mt-auto border-t border-gray-100 pt-6">
                            <p className="text-xs text-gray-400 text-center">&copy; 2024 UEP Event System</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
