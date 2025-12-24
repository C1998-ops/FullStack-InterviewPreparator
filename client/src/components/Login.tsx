import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePKCEPair } from "../utils/pkce";
import { buildAuthorizationUrl, getAuthConfig } from "../utils/auth";
import { useAuthContext } from "../context/AuthContext";

/**
 * Login component implementing Authorization Code Flow with PKCE
 *
 * Flow:
 * 1. Generate code verifier and challenge
 * 2. Store verifier in sessionStorage
 * 3. Redirect to authorization server
 *
 * The callback is handled by the AuthCallback component at /auth/callback
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      const config = getAuthConfig();

      if (!config.clientId) {
        throw new Error(
          "OAuth client ID not configured. Please set VITE_AUTH_CLIENT_ID environment variable."
        );
      }

      // Generate PKCE pair
      const { codeVerifier, codeChallenge } = await generatePKCEPair();

      // Generate state for CSRF protection
      const state = generateRandomState();

      // Store code verifier and state in sessionStorage
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);
      sessionStorage.setItem("pkce_state", state);

      // Store OAuth redirect URI (must match what's sent to Google)
      sessionStorage.setItem("oauth_redirect_uri", config.redirectUri);

      // Store current URL for redirect after login (for navigation, not OAuth)
      // Only set if not already set by a protected route or component
      if (!sessionStorage.getItem("return_url")) {
        sessionStorage.setItem("return_url", window.location.pathname);
      }

      // Build authorization URL and redirect
      const authUrl = buildAuthorizationUrl(config, codeChallenge, state);
      window.location.href = authUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate login. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const generateRandomState = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  // Show loading/processing state
  if (isProcessing) {
    return (
      <div className="login-container">
        <div className="login-loading">
          <div className="login-spinner">
            <div className="login-spinner-ring"></div>
            <div className="login-spinner-ring"></div>
            <div className="login-spinner-ring"></div>
          </div>
          <h2 className="login-loading-title">Processing authentication...</h2>
          <p className="login-loading-text">
            Redirecting to secure login provider
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="login-container">
        <div className="login-card login-card-error">
          <div className="login-error-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="login-error-title">Authentication Error</h2>
          <p className="login-error-message">{error}</p>
          <button onClick={handleLogin} className="login-button login-button-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <span className="login-icon">📚</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access JavaScript Interview Questions
          </p>
        </div>

        {/* Main Content */}
        <div className="login-content">
          <button
            onClick={handleLogin}
            disabled={isProcessing}
            className="login-button login-button-oauth"
          >
            <svg
              className="login-oauth-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="login-button-text">Continue with Google</span>
            <svg
              className="login-button-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        {/* Footer Section */}
        <div className="login-footer">
          <div className="login-security-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Secure PKCE authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
