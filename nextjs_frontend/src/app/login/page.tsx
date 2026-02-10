"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Illustrations mimicking legacy absolute positioning */}
            {/* We use Next/Image but need to be careful with z-index */}

            {/* Mobile Login Bro - Bottom Left */}
            <div className="absolute bottom-[-50px] left-[-0px] w-[350px] md:w-[500px] z-0 pointer-events-none opacity-80 md:opacity-100 hidden md:block">
                {/* Using a placeholder SVG or the real path if available. 
             Since we can't easily copy assets, we'll use a placeholder or assume the user copies them.
             For now, we'll assume standard layout without the specific SVG unless provided.
             Legacy path: ../../images/illustration/Mobile login-bro.svg
         */}
                <Image
                    src="/images/illustration/Mobile login-bro.svg"
                    alt="Mobile Login"
                    width={500}
                    height={400}
                    className="w-full h-auto"
                // Fallback strategy: if this path is invalid, it shows alt.
                // In a real migration, we'd ensure these assets are in /public/images
                />
            </div>

            {/* Windy Day Bro - Top Right */}
            <div className="absolute top-10 right-[-30px] w-[300px] md:w-[450px] z-0 pointer-events-none opacity-50 md:opacity-100 hidden md:block">
                <Image
                    src="/images/illustration/Windy day-bro.svg"
                    alt="Windy Day"
                    width={450}
                    height={350}
                    className="w-full h-auto"
                />
            </div>

            {/* Main Login Box */}
            <div className={`relative z-10 w-full bg-white rounded-[30px] shadow-2xl flex flex-col items-center pt-4 pb-4 overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'login' ? 'max-w-[480px] min-h-[500px]' : 'max-w-[730px] min-h-[400px]'}`}>

                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 flex items-center gap-1 text-primary font-bold text-sm hover:underline z-20"
                >
                    <ArrowLeft size={18} /> Back
                </Link>

                {/* Logo */}
                <div className="w-[120px] h-[120px] mb-6 drop-shadow-md">
                    {/* Legacy: ../../images/uep_logo.png */}
                    <Image
                        src="/images/uep_logo.png"
                        alt="UEP Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                    />
                </div>

                {/* Tabs */}
                <div className="relative w-[80%] h-[50px] bg-gray-100 rounded-full flex items-center justify-between p-1.5 shadow-inner mb-6">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 text-center text-sm font-bold z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab("register")}
                        className={`flex-1 text-center text-sm font-bold z-10 transition-colors duration-300 ${activeTab === 'register' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Register
                    </button>

                    {/* Sliding Indicator */}
                    <div
                        className={`absolute h-[40px] w-[calc(50%-6px)] bg-gradient-to-r from-primary to-[#2a5298] rounded-full transition-all duration-300 shadow-md ${activeTab === 'login' ? 'left-1.5' : 'left-[50%]'}`}
                    ></div>
                </div>

                {/* Form Container with Scrollbar logic if needed (Legacy had custom scrollbar) */}
                <div className="w-full flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {activeTab === 'login' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <LoginForm />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <RegisterForm />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
