'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="mb-4">
                    <svg
                        className="w-16 h-16 text-red-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 font-sans">
                    Oops! Something went wrong.
                </h2>
                <p className="text-gray-600 mb-6 font-sans">
                    We encountered an unexpected issue. Please try refreshing the page or try again later.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-200"
                    >
                        Return to Home
                    </button>
                </div>
                {/* Technical details only visible in development for debugging */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left bg-gray-100 p-4 rounded overflow-auto max-h-40 text-xs text-gray-500">
                        <p className="font-bold mb-1">Error Details (Dev Only):</p>
                        <p>{error.message || 'No error message available'}</p>
                        {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
