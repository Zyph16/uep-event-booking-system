"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login form submitted");
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        console.log("Form data:", data);

        try {
            const hostname = window.location.hostname;
            console.log(`Fetching http://${hostname}:5000/api/users/login...`);
            const response = await fetch(`http://${hostname}:5000/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            console.log("Response status:", response.status);

            const result = await response.json();
            console.log("Response body:", result);

            if (!response.ok) {
                throw new Error(result.error || "Login failed");
            }

            // Store token and user info
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Redirect based on role
            // Check if roleName exists, otherwise default to client/user
            const role = result.user.role_name || "CLIENT";
            console.log("Redirecting to role:", role);

            switch (role) {
                case "ADMIN":
                    router.push("/admin/dashboard");
                    break;
                case "UNIVERSITY PRESIDENT":
                case "UNIVERSITY_PRESIDENT":
                case "PRESIDENT":
                    router.push("/president/dashboard");
                    break;
                case "PROJECT MANAGER":
                case "PROJECT_MANAGER":
                    router.push("/pm/dashboard");
                    break;
                case "CLIENT":
                case "USER":
                    router.push("/");
                    break;
                default:
                    router.push("/");
            }

        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="login-form" className="w-[85%] mx-auto mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex flex-col gap-2 relative">
                <label htmlFor="username" className="text-primary font-bold text-sm tracking-wide ml-2 uppercase">
                    Username
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        required
                        className="w-full bg-input-bg border-none outline-none px-5 py-3 rounded-full text-text-main font-medium shadow-inner focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 relative">
                <label htmlFor="password" className="text-primary font-bold text-sm tracking-wide ml-2 uppercase">
                    Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full bg-input-bg border-none outline-none px-5 py-3 rounded-full text-text-main font-medium shadow-inner focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-[180px] mx-auto mt-8 bg-gradient-to-r from-primary to-[#2a5298] text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center mt-4 text-xs text-gray-500">
                <a href="#" className="hover:text-primary underline">Forgot Password?</a>
            </div>
        </form>
    );
}
