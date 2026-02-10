"use client";

import React, { useEffect, useState } from "react";
import { Users, Building2, CheckCircle, Smartphone } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFacilities: 0,
        activeFacilities: 0,
        activeUsers: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentFacilities, setRecentFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = "http://192.168.1.31:5000/api"; // Adjust if needed

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch Users
                const usersRes = await fetch(`${API_BASE}/users`, { headers });
                const usersData = await usersRes.json();
                const usersList = usersData.users || [];

                // Fetch Facilities
                const facilRes = await fetch(`${API_BASE}/facilities`, { headers });
                const facilData = await facilRes.json();
                const facilList = facilData.facilities || [];

                setStats({
                    totalUsers: usersList.length,
                    totalFacilities: facilList.length,
                    activeUsers: usersList.length, // Assuming all active for now as per legacy logic
                    activeFacilities: facilList.filter((f: any) => f.status === 'available').length
                });

                setRecentUsers(usersList.slice(0, 5));
                setRecentFacilities(facilList.slice(0, 5));

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1f3c88] mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Get a quick snapshot of your system — users, facilities — all in one place.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-[#1f3c88] text-white p-6 rounded-2xl shadow-lg transform transition hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <Users size={24} />
                        <span className="font-semibold">Total Users</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.totalUsers}</div>
                    <div className="text-sm opacity-70">Registered users in the system</div>
                </div>

                {/* Total Facilities */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2 text-[#1f3c88]">
                        <Building2 size={24} />
                        <span className="font-semibold">Total Facilities</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">{stats.totalFacilities}</div>
                    <div className="text-sm text-gray-500">Available facilities</div>
                </div>

                {/* Active Facilities */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2 text-green-600">
                        <CheckCircle size={24} />
                        <span className="font-semibold">Active Facilities</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">{stats.activeFacilities}</div>
                    <div className="text-sm text-gray-500">Currently available</div>
                </div>

                {/* Active Users */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2 text-[#e91e63]">
                        <Smartphone size={24} />
                        <span className="font-semibold">Active Users</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-500">Active user accounts</div>
                </div>
            </div>

            {/* Recent Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Recently Added Users</h3>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <div className="text-gray-400 text-sm text-center py-4">No users yet</div>
                        ) : (
                            recentUsers.map((user: any, i) => (
                                <div key={i} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        {user.username?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{user.username}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    <div className="ml-auto text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        {user.role_name || "User"}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Facilities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Recently Added Facilities</h3>
                    <div className="space-y-4">
                        {recentFacilities.length === 0 ? (
                            <div className="text-gray-400 text-sm text-center py-4">No facilities yet</div>
                        ) : (
                            recentFacilities.map((fac: any, i) => (
                                <div key={i} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{fac.facility_name}</div>
                                        <div className="text-xs text-gray-500">{fac.location} • {fac.capacity} pax</div>
                                    </div>
                                    <div className={`ml-auto text-xs font-semibold px-2 py-1 rounded ${fac.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {fac.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
