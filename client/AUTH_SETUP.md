# OAuth 2.0 PKCE Authentication Setup

This application implements the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for secure OAuth 2.0 authentication.

## Features

- ✅ Secure PKCE flow (RFC 7636)
- ✅ CSRF protection with state parameter
- ✅ Token storage and management
- ✅ User information retrieval
- ✅ Automatic token refresh support

## Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# OAuth Provider Configuration
VITE_AUTH_AUTHORIZATION_ENDPOINT=https://accounts.google.com/o/oauth2/v2/auth
VITE_AUTH_TOKEN_ENDPOINT=https://oauth2.googleapis.com/token
VITE_AUTH_USERINFO_ENDPOINT=https://www.googleapis.com/oauth2/v2/userinfo

# Client Configuration
VITE_AUTH_CLIENT_ID=your-client-id-here
VITE_AUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# Optional: Scopes (space-separated)
VITE_AUTH_SCOPES=openid profile email
```

## OAuth Provider Setup

### Google OAuth Example

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5173/auth/callback` (for development)
6. Copy the Client ID to your `.env` file

### Custom OAuth Provider

For a custom OAuth provider, update the endpoints in your `.env` file:

```env
VITE_AUTH_AUTHORIZATION_ENDPOINT=https://your-provider.com/oauth/authorize
VITE_AUTH_TOKEN_ENDPOINT=https://your-provider.com/oauth/token
VITE_AUTH_USERINFO_ENDPOINT=https://your-provider.com/oauth/userinfo
```

## Usage

### Using the Login Component

The `Login` component handles the entire OAuth flow:

```tsx
import Login from "./components/Login";

// In your routes
<Route path="/login" element={<Login />} />
```

### Using the Auth Context

Access authentication state anywhere in your app:

```tsx
import { useAuthContext } from "./context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, token, logout } = useAuthContext();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

To protect routes, check authentication status:

```tsx
import { useAuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

## How PKCE Works

1. **Code Verifier Generation**: A random code verifier is generated
2. **Code Challenge Creation**: SHA256 hash of the verifier is created and base64url-encoded
3. **Authorization Request**: User is redirected to OAuth provider with the code challenge
4. **Authorization Code**: Provider returns an authorization code
5. **Token Exchange**: Authorization code is exchanged for tokens using the original code verifier
6. **Verification**: Provider verifies the code challenge matches the verifier

This ensures that even if the authorization code is intercepted, it cannot be used without the code verifier.

## Security Features

- **PKCE**: Prevents authorization code interception attacks
- **State Parameter**: CSRF protection
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
- **Session Storage**: Code verifier stored temporarily in sessionStorage

## Routes

- `/login` - Login page that initiates OAuth flow
- `/auth/callback` - OAuth callback handler

## API Reference

### `generatePKCEPair()`
Generates a code verifier and challenge pair.

### `buildAuthorizationUrl(config, codeChallenge, state?)`
Builds the authorization URL with PKCE parameters.

### `exchangeCodeForToken(config, code, codeVerifier)`
Exchanges authorization code for access token.

### `useAuthContext()`
React hook providing:
- `user`: Current user object
- `token`: Access token
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state
- `login()`: Initiate login flow
- `logout()`: Clear authentication
- `setAuthData(token, user)`: Set authentication data

