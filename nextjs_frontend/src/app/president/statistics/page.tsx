"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Filter, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { getApiBaseUrl } from "@/utils/config";

const API_BASE = getApiBaseUrl();

export default function StatisticsPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [period, setPeriod] = useState<"monthly" | "annually" | "custom">("monthly");
    const [selectedFacility, setSelectedFacility] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    // Custom Date Range
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Summary Stats
    const [totalIncome, setTotalIncome] = useState(0);
    const [topMonth, setTopMonth] = useState({ label: "N/A", amount: 0 });

    useEffect(() => {
        fetchFacilities();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [period, selectedFacility, startDate, endDate]);

    const fetchFacilities = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/facilities`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFacilities(data);
                } else if (data.facilities && Array.isArray(data.facilities)) {
                    setFacilities(data.facilities);
                } else {
                    setFacilities([]);
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

            let query = `period=${period !== 'custom' ? period : 'monthly'}&facilityId=${selectedFacility}`;

            // If custom, or if users want to filter monthly view by specific dates
            if (startDate) query += `&startDate=${startDate}`;
            if (endDate) query += `&endDate=${endDate}`;

            const res = await fetch(`${API_BASE}/billing/income-stats?${query}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                // Format for chart
                const formatted = data.map((item: any) => ({
                    name: formatLabel(item.label),
                    originalLabel: item.label,
                    Income: parseFloat(item.income)
                }));

                setStats(formatted);

                // Calculate Summary
                const total = formatted.reduce((acc: number, curr: any) => acc + curr.Income, 0);
                setTotalIncome(total);

                if (formatted.length > 0) {
                    const top = formatted.reduce((prev: any, current: any) => (prev.Income > current.Income) ? prev : current);
                    setTopMonth({ label: top.name, amount: top.Income });
                } else {
                    setTopMonth({ label: "N/A", amount: 0 });
                }
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to make "2024-01" -> "Jan '24"
    const formatLabel = (label: string) => {
        if (!label) return "";
        // Monthly: YYYY-MM
        if (label.match(/^\d{4}-\d{2}$/)) {
            const date = new Date(label + "-01");
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
        // Daily: YYYY-MM-DD
        if (label.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(label);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return label;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">University Income Statistics</h1>
                <p className="text-gray-500">Real-time overview of generated revenue from facility rentals.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#1f3c88] to-[#2a52be] rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <DollarSign size={24} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white/90">Total Revenue</span>
                    </div>
                    <div>
                        <p className="text-sm text-blue-100 opacity-80 mb-1">Total Verified Income</p>
                        <h3 className="text-3xl font-black">₱ {totalIncome.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-100 p-3 rounded-2xl">
                            <TrendingUp size={24} className="text-green-600" />
                        </div>
                        <span className="bg-green-50 px-3 py-1 rounded-full text-xs font-bold text-green-700">Top Period</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Highest Earning Period</p>
                        <h3 className="text-2xl font-bold text-gray-800">{topMonth.label}</h3>
                        <p className="text-sm font-semibold text-green-600">₱ {topMonth.amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-100 p-3 rounded-2xl">
                            <Filter size={24} className="text-orange-600" />
                        </div>
                        <span className="bg-orange-50 px-3 py-1 rounded-full text-xs font-bold text-orange-700">Active Filter</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Current Facility View</p>
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                            {selectedFacility === 'all' ? 'All Facilities' : facilities.find(f => String(f.facilityID) === String(selectedFacility))?.facility_name || 'Unknown'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-center">
                {/* Left: View Modes */}
                <div className="bg-gray-100 p-1.5 rounded-2xl flex w-full xl:w-auto overflow-x-auto">
                    {['monthly', 'annually', 'custom'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${period === p
                                ? "bg-white text-[#1f3c88] shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)} view
                        </button>
                    ))}
                </div>

                {/* Right: Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    {/* Facility Select */}
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <select
                            value={selectedFacility}
                            onChange={(e) => setSelectedFacility(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#1f3c88]/20 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option value="all">All Facilities</option>
                            {facilities.map((f) => (
                                <option key={f.facilityID} value={f.facilityID}>
                                    {f.facility_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Inputs (Visible only when meaningful or custom) */}
                    <div className="flex gap-2 items-center bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent border-0 text-gray-600 text-sm font-medium focus:ring-0 p-1"
                            value={startDate}
                            onChange={(e) => { setPeriod("custom"); setStartDate(e.target.value); }}
                            placeholder="Start Date"
                        />
                        <span className="text-gray-300">-</span>
                        <input
                            type="date"
                            className="bg-transparent border-0 text-gray-600 text-sm font-medium focus:ring-0 p-1"
                            value={endDate}
                            onChange={(e) => { setPeriod("custom"); setEndDate(e.target.value); }}
                        />
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-[500px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-3xl">
                        <div className="animate-pulse flex flex-col items-center gap-3">
                            <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                            <p className="text-sm font-semibold text-gray-400">Loading Chart Data...</p>
                        </div>
                    </div>
                ) : stats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <TrendingUp size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg text-gray-300">No income data available</p>
                        <p className="text-sm opacity-60">Try adjusting your date filters or facility</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 4 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                                formatter={(value: number | undefined) => [`₱${(value || 0).toLocaleString()}`, "Revenue"]}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '24px' }}
                                iconType="circle"
                            />
                            <Bar
                                name="Verified Income"
                                dataKey="Income"
                                fill="#1f3c88"
                                radius={[6, 6, 6, 6]}
                                barSize={40}
                                activeBar={{ fill: '#e91e63' }}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
