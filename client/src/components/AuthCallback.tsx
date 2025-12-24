import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeForTokenViaBackend, getAuthConfig } from "../utils/auth";
import { useAuthContext } from "../context/AuthContext";

/**
 * AuthCallback component handles the OAuth callback
 * This component processes the authorization code and exchanges it for tokens
 */
const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const state = searchParams.get("state");

    // Handle OAuth error
    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // Handle authorization code
    if (code) {
      handleCallback(code, state);
    } else {
      setError("No authorization code received");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [searchParams, navigate]);

  const handleCallback = async (code: string, state: string | null) => {
    try {
      // Retrieve code verifier from sessionStorage
      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      const storedState = sessionStorage.getItem("pkce_state");

      // Verify state to prevent CSRF attacks
      if (state && storedState !== state) {
        throw new Error("Invalid state parameter. Possible CSRF attack.");
      }

      if (!codeVerifier) {
        throw new Error(
          "Code verifier not found. Please try logging in again."
        );
      }

      // Get OAuth redirect URI from sessionStorage (must match authorization request)
      // Fallback to config if not found (for backward compatibility)
      const config = getAuthConfig();
      const redirect_uri =
        sessionStorage.getItem("oauth_redirect_uri") || config.redirectUri;

      if (!redirect_uri) {
        throw new Error("Redirect URI not found. Please try logging in again.");
      }

      // Exchange authorization code for JWT token via backend
      const response = await exchangeCodeForTokenViaBackend(
        code,
        codeVerifier,
        redirect_uri
      );

      // Map user info to match User interface (id is required, use email as id)
      const userInfo = {
        id: response.user?.email || "",
        email: response.user?.email,
        picture: response.user?.picture,
      };

      // Store authentication data (JWT token from backend with expiration time)
      setAuthData(response.token, userInfo, response.expiresAt);

      // Clean up sessionStorage
      sessionStorage.removeItem("pkce_code_verifier");
      sessionStorage.removeItem("pkce_state");
      sessionStorage.removeItem("oauth_redirect_uri");

      // Redirect to home or intended destination
      const returnUrl = sessionStorage.getItem("return_url") || "/";
      sessionStorage.removeItem("return_url");
      navigate(returnUrl, { replace: true });
    } catch (err) {
      console.error("Authentication error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
