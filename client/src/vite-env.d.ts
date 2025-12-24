/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_AUTHORIZATION_ENDPOINT?: string;
  readonly VITE_AUTH_TOKEN_ENDPOINT?: string;
  readonly VITE_AUTH_CLIENT_ID?: string;
  readonly VITE_AUTH_REDIRECT_URI?: string;
  readonly VITE_AUTH_SCOPES?: string;
  readonly VITE_AUTH_USERINFO_ENDPOINT?: string;
  // Add other env variables as needed
  readonly [key: string]: any;
}

