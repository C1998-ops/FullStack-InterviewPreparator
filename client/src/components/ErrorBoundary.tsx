import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

/**
 * Error Boundary component for React Router
 * Handles errors from loaders, actions, and component rendering
 */
const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  // Check if it's a Response error (from loader/action)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-xl bg-white px-8 py-10 shadow-xl text-center">
          <div className="mb-5 text-5xl sm:text-6xl">😕</div>
          <h2 className="mb-3 text-3xl sm:text-4xl font-semibold text-gray-900">
            {error.status}{" "}
            <span className="font-normal">{error.statusText}</span>
          </h2>
          <p className="mb-7 text-base sm:text-lg text-gray-500">
            {error.data?.message || "Something went wrong"}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-base font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <svg
              className="h-5 w-5 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3.75 12.75M3.75 12.75L10.5 6M3.75 12.75H21"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Handle other types of errors
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary;
