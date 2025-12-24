/**
 * PKCE (Proof Key for Code Exchange) utility functions
 * Implements RFC 7636 for secure OAuth 2.0 authorization code flow
 */

/**
 * Generate a random code verifier for PKCE
 * @param length - Length of the code verifier (default: 128)
 * @returns Base64URL-encoded random string
 */
export const generateCodeVerifier = (length: number = 128): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  // Convert to base64url
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .substring(0, length);
};

/**
 * Generate code challenge from code verifier using SHA256
 * @param verifier - The code verifier
 * @returns Promise resolving to base64url-encoded SHA256 hash
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  
  // Convert to base64url
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

/**
 * Generate both code verifier and challenge
 * @returns Promise resolving to object with verifier and challenge
 */
export const generatePKCEPair = async (): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  return { codeVerifier, codeChallenge };
};

