/**
 * Authentication utility functions
 */

import axios from "axios";

export interface AuthConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Build authorization URL with PKCE parameters
 */
export const buildAuthorizationUrl = (
  config: AuthConfig,
  codeChallenge: string,
  state?: string
): string => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: config.scopes?.join(" ") || "openid profile email",
    ...(state && { state }),
  });

  return `${config.authorizationEndpoint}?${params.toString()}`;
};

/**
 * Exchange authorization code for token via backend API
 * This uses the backend endpoint which handles PKCE and returns a JWT
 */
export const exchangeCodeForTokenViaBackend = async (
  code: string,
  codeVerifier: string,
  redirect_uri: string
): Promise<{
  token: string;
  user?: any;
  expiresAt?: number | null;
  expiresIn?: number;
}> => {
  const apiUrl =
    import.meta.env.VITE_ENVIRONMENT === "development"
      ? import.meta.env.VITE_API_URL_DEVELOPMENT
      : import.meta.env.VITE_API_URL_PRODUCTION;

  const response = await axios.post(
    `${apiUrl}/auth/pkce-token`,
    {
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirect_uri,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Get auth config from environment or defaults
 */
export const getAuthConfig = (): AuthConfig => {
  return {
    authorizationEndpoint:
      import.meta.env.VITE_AUTH_AUTHORIZATION_ENDPOINT ||
      "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint:
      import.meta.env.VITE_AUTH_TOKEN_ENDPOINT ||
      "https://oauth2.googleapis.com/token",
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID || "",
    redirectUri:
      import.meta.env.VITE_AUTH_REDIRECT_URI ||
      `${window.location.origin}/auth/callback`,
    scopes: import.meta.env.VITE_AUTH_SCOPES?.split(" ") || [
      "openid",
      "profile",
      "email",
    ],
  };
};
