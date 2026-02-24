/**
 * Helper to get the API Base URL dynamically.
 * This allows the frontend to work whether accessed via localhost or a local network IP (e.g., 192.168.x.x).
 */
export const getApiBaseUrl = () => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Backend is assumed to be running on port 5000 on the same host
        return `http://${hostname}:5000/api`;
    }
    // Fallback for server-side rendering (SSR) - use localhost or env var
    return process.env.API_BASE_URL || 'http://localhost:5000/api';
};

/**
 * Helper to get the Backend Base URL (for static files/images) dynamically.
 */
export const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:5000`;
    }
    return process.env.BACKEND_URL || 'http://localhost:5000';
};
