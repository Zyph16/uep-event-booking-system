/**
 * Helper to get the API Base URL dynamically.
 * This allows the frontend to work whether accessed via localhost or a local network IP (e.g., 192.168.x.x).
 */
export const getApiBaseUrl = () => {
    // 2. Check if running in browser environment (Fallback for VPS / Local Network)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If hosted on Vercel, explicitly route to Vercel Backend
        if (hostname.includes('vercel.app')) {
            return 'https://uepbackend.vercel.app/api';
        }

        // Backend is assumed to be running on port 5000 on the same host
        return `http://${hostname}:5000/api`;
    }

    // 3. Fallback for server-side rendering (SSR)
    return 'https://uepbackend.vercel.app/api';
};

/**
 * Helper to get the Backend Base URL (for static files/images) dynamically.
 */
export const getBackendUrl = () => {
    // Browser environment fallback
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If hosted on Vercel, explicitly route to Vercel Backend
        if (hostname.includes('vercel.app')) {
            return 'https://uepbackend.vercel.app';
        }

        return `http://${hostname}:5000`;
    }

    // SSR fallback
    return 'https://uepbackend.vercel.app';
};
