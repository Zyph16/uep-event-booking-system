/**
 * Helper to get the API Base URL dynamically.
 * This allows the frontend to work whether accessed via localhost or a local network IP (e.g., 192.168.x.x).
 */
export const getApiBaseUrl = () => {
    // 1. Check if a production Cloud URL is explicitly defined in .env
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }

    // 2. Check if running in browser environment (Fallback for VPS / Local Network)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Backend is assumed to be running on port 5000 on the same host
        return `http://${hostname}:5000/api`;
    }

    // 3. Fallback for server-side rendering (SSR)
    return process.env.API_BASE_URL || 'http://localhost:5000/api';
};

/**
 * Helper to get the Backend Base URL (for static files/images) dynamically.
 */
export const getBackendUrl = () => {
    // 1. Check if a production Cloud URL is explicitly defined in .env
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
        return process.env.NEXT_PUBLIC_BACKEND_URL;
    }

    // 2. Browser environment fallback
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:5000`;
    }

    // 3. SSR fallback
    return process.env.BACKEND_URL || 'http://localhost:5000';
};

/**
 * Helper to display images, supporting both local legacy relative URLs and absolute Cloudinary URLs.
 */
export const getDisplayImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already an absolute Cloudinary/external URL
    return `${getBackendUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
};
