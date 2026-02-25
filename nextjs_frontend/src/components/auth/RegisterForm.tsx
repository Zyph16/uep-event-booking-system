import Link from "next/link";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Building, Lock, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/shared/StatusModal";

export default function RegisterForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        status: "info" as "success" | "error" | "warning" | "info",
        title: "",
        message: ""
    });

    // Form State
    const [formData, setFormData] = useState({
        firstname: "",
        middlename: "",
        lastname: "",
        username: "",
        email: "",
        contactNo: "",
        street: "",
        city: "",
        province: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare payload for backend
            const payload = {
                username: formData.username,
                password: formData.password,
                personalInfo: {
                    fname: formData.firstname,
                    mname: formData.middlename,
                    lname: formData.lastname,
                    email: formData.email,
                    phone: formData.contactNo,
                    street: formData.street,
                    city: formData.city,
                    province: formData.province
                }
            };

            const hostname = window.location.hostname;
            const response = await fetch(`http://${hostname}:5000/api/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                // Check for validation errors or general error
                const errorMsg = result.errors
                    ? Object.values(result.errors).flat().join(", ")
                    : result.error || "Registration failed";
                throw new Error(errorMsg);
            }

            // Success
            setModal({
                isOpen: true,
                status: "success",
                title: "Account Created",
                message: "Your account has been successfully created! You can now log in."
            });

        } catch (err: any) {
            console.error("Register Error:", err);
            setModal({
                isOpen: true,
                status: "error",
                title: "Registration Failed",
                message: err.message || "An unexpected error occurred."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.status === "success") {
            router.push("/login"); // Redirect to login on success
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">

            <form id="register-form" className="w-[95%] sm:w-[680px] mx-auto mt-0 pb-4 px-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl flex flex-col justify-center relative overflow-hidden" onSubmit={handleSubmit}>

                {/* Decorative background blur element */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 pointer-events-none opacity-50" />

                <div className="text-center mb-4 pt-4 relative z-10">
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary to-[#c2410c] uppercase tracking-wide drop-shadow-sm">Create Account</h2>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-1">START YOUR JOURNEY WITH US</p>
                </div>

                <div className="grid gap-3 relative z-10">

                    {/* Row 1: Names */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">First Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <User size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="firstname"
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="John"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Middle Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <User size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="middlename"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="Doe"
                                    value={formData.middlename}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Last Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <User size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="lastname"
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="Smith"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Contact & Account */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <Hash size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="johnsmith"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <Mail size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <Phone size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="contactNo"
                                    required
                                    maxLength={11}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="0912..."
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Street</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <Building size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="street"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="Building/St."
                                    value={formData.street}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">City</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <MapPin size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="city"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Province</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <MapPin size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="province"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="Province"
                                    value={formData.province}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Password */}
                    <div className="grid grid-cols-1">
                        <div className="group relative">
                            <label className="block text-gray-500 text-[9px] font-bold ml-1 mb-1 uppercase tracking-wider group-focus-within:text-secondary transition-colors">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                                    <Lock size={14} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className="w-full pl-9 pr-10 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all duration-300 outline-none font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors hover:bg-gray-100 p-1 rounded-full"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-secondary h-12 to-[#c2410c] text-white font-bold rounded-2xl shadow-lg hover:shadow-secondary/40 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 text-sm disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
                    </button>

                </div>
            </form>

            <StatusModal
                isOpen={modal.isOpen}
                onClose={handleModalClose}
                status={modal.status}
                title={modal.title}
                message={modal.message}
                actionLabel={modal.status === "success" ? "Go to Login" : "Okay"}
            />
        </div>
    );
}
