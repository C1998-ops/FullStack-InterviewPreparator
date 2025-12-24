import { parse } from "marked";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Context,
} from "react";

export interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  expiresAt: number | null; // Expiration timestamp in milliseconds
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setAuthData: (token: string, user: User, expiresAt?: number | null) => void;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(
    AuthContext as unknown as Context<AuthContextType | undefined>
  );
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const storedExpiresAt = localStorage.getItem("token_expires_at");

    if (storedToken && storedUser) {
      try {
        const expiresAtValue = storedExpiresAt
          ? parseInt(storedExpiresAt)
          : null;
        if (expiresAtValue && expiresAtValue < Date.now()) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          localStorage.removeItem("token_expires_at");
          setToken(null);
          setUser(null);
          setExpiresAt(null);
          setIsLoading(false);
          return;
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setExpiresAt(expiresAtValue);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("token_expires_at");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async () => {
    // This will be handled by the Login component
    // The actual redirect happens there
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setExpiresAt(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("refresh_token");
  };

  const setAuthData = (
    newToken: string,
    newUser: User,
    newExpiresAt?: number | null
  ) => {
    setToken(newToken);
    setUser(newUser);
    setExpiresAt(newExpiresAt || null);
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    if (newExpiresAt) {
      localStorage.setItem("token_expires_at", newExpiresAt.toString());
    } else {
      localStorage.removeItem("token_expires_at");
    }
  };

  const isTokenExpired = (): boolean => {
    if (!expiresAt) return false; // If no expiration time, assume not expired
    return Date.now() >= expiresAt;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        expiresAt,
        isAuthenticated: !!user && !!token && !isTokenExpired(),
        isLoading,
        login,
        logout,
        setAuthData,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
