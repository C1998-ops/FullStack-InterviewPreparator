import { RouteObject } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import DocsLayout from "../components/layouts/DocsLayout";
import HomePage from "../pages/HomePage";
import DocsPage from "../pages/DocsPage";
import ResumeAnalyser from "../pages/ResumeAnalyser";
import Login from "../components/Login";
import AuthCallback from "../components/AuthCallback";
import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Application routes configuration
 * Using React Router Remix nested routes pattern with data APIs
 *
 * Modern React Router features:
 * - Loaders: Data fetching before component renders
 * - Error Boundaries: Route-level error handling
 * - Nested Routes: Layout composition
 */

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
    errorElement: <ErrorBoundary />,
  },
  {
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorBoundary />,
        // loader: async () => {
        //   try {
        //     const result = await fetch(
        //       "https://jsonplaceholder.typicode.com/posts"
        //     );

        //     if (!result.ok) {
        //       throw new Response(
        //         JSON.stringify({
        //           message: `Failed to fetch posts: ${result.statusText}`,
        //         }),
        //         {
        //           status: result.status,
        //           statusText: result.statusText,
        //           headers: { "Content-Type": "application/json" },
        //         }
        //       );
        //     }

        //     const data = await result.json();
        //     return {
        //       posts: data,
        //     };
        //   } catch (error) {
        //     // Re-throw Response errors as-is
        //     if (error instanceof Response) {
        //       throw error;
        //     }
        //     // Wrap other errors in a Response
        //     throw new Response(
        //       JSON.stringify({
        //         message:
        //           error instanceof Error
        //             ? error.message
        //             : "Unknown error occurred",
        //       }),
        //       {
        //         status: 500,
        //         statusText: "Internal Server Error",
        //         headers: { "Content-Type": "application/json" },
        //       }
        //     );
        //   }
        // },
      },
      {
        path: "/resume-assistant",
        element: (
          <ProtectedRoute allowViewing={true}>
            <ResumeAnalyser />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
    ],
  },
  {
    element: <DocsLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/browse/documents",
        element: <DocsPage />,
      },
    ],
  },
];
