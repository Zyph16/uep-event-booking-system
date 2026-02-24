"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Function to check session validity
        const checkSession = () => {
            const token = localStorage.getItem("token");
            const expiry = localStorage.getItem("tokenExpiry");

            // If no token, we can't do much (pages handle their own redirects usually), 
            // but if there IS a token, we must ensure it isn't expired.
            if (token && expiry) {
                const now = new Date().getTime();
                if (now > parseInt(expiry, 10)) {
                    // Token expired
                    console.log("Session expired. Logging out...");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("tokenExpiry");
                    window.location.href = "/login?expired=true";
                }
            } else if (token && !expiry) {
                // If token exists but no expiry (legacy session or manually set)
                console.log("No expiry found for existing session. Forcing logout to strict session policy.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        };

        // Check on mount
        checkSession();

        // Check periodically (every minute)
        const interval = setInterval(checkSession, 60000);

        // Check immediately when the tab becomes active or gets focus
        // This combats browsers suspending setInterval on hidden tabs/sleeping computers
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkSession();
        };

        window.addEventListener("focus", checkSession);
        window.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", checkSession);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname, router]);

    return <>{children}</>;
}
