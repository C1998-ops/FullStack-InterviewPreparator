import { useAuthContext } from "@/context/AuthContext";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  /**
   * Child components to render when route is accessible
   */
  children?: React.ReactNode;
  /**
   * If true, allows users to view the page without authentication.
   * They will still need to login to use protected features.
   * Default: true (allows viewing without redirect)
   */
  allowViewing?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowViewing = true,
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If allowViewing is true, render content regardless of authentication
  // The component itself will handle showing login prompts for protected actions
  if (allowViewing) {
    return <>{children || <Outlet />}</>;
  }

  // Default behavior: require authentication
  if (!isAuthenticated) {
    // Store the attempted location for redirect after login
    sessionStorage.setItem("return_url", location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected children
  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
