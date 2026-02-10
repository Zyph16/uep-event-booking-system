"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { Filter } from "lucide-react";

export default function PresidentStatistics() {
    const [stats, setStats] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [period, setPeriod] = useState<"monthly" | "annually">("monthly");
    const [selectedFacility, setSelectedFacility] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacilities();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [period, selectedFacility]);

    const fetchFacilities = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://192.168.1.31:5000/api/facilities", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFacilities(data);
                } else {
                    console.error("Facilities data is not an array:", data);
                    // Check if it's wrapped in { facilities: ... } (old format)
                    if (data.facilities && Array.isArray(data.facilities)) {
                        console.warn("Detected old API format { facilities: [...] }. Using data.facilities.");
                        setFacilities(data.facilities);
                    } else {
                        setFacilities([]);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch facilities", err);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://192.168.1.31:5000/api/billing/income-stats?period=${period}&facilityId=${selectedFacility}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // backend returns { label: '2023-01', income: 1000 }
                // reformat for chart if needed, but recharts handles this well
                const formatted = data.map((item: any) => ({
                    name: item.label,
                    Income: parseFloat(item.income)
                }));
                setStats(formatted);
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">University Income Statistics</h1>
                    <p className="text-gray-500">Overview of income generated from facility rentals.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Period Filter Pills */}
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setPeriod("monthly")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === "monthly" ? "bg-white text-[#1f3c88] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setPeriod("annually")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === "annually" ? "bg-white text-[#1f3c88] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Annually
                        </button>
                    </div>

                    {/* Facility Dropdown */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={selectedFacility}
                            onChange={(e) => setSelectedFacility(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1f3c88]/20 focus:border-[#1f3c88] appearance-none cursor-pointer min-w-[200px]"
                        >
                            <option value="all">All Facilities</option>
                            {facilities.map((f) => (
                                <option key={f.facilityID} value={f.facilityID}>
                                    {f.facility_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-[500px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                        Loading statistics...
                    </div>
                ) : stats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <p className="font-medium mb-1">No income data available</p>
                        <p className="text-sm opacity-60">Try adjusting your filters</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number | undefined) => [`₱${(value || 0).toLocaleString()}`, "Income"]}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="Income"
                                fill="#1f3c88"
                                radius={[6, 6, 0, 0]}
                                barSize={60}
                                activeBar={{ fill: '#0d2b6b' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
