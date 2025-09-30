import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { User } from '../types';

interface SignupData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Auto-refresh token before expiry
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryTime) return;

      const timeUntilExpiry = parseInt(expiryTime) - Date.now();
      // Refresh 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshToken();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    checkTokenExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid token
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return;

      const response = await authApi.refreshToken(refreshToken);
      const { access_token, expires_in } = response;

      // Store new token
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expires_in * 1000).toString());
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
    }
  };

  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      const response = await authApi.login(email, password);
      const { access_token, refresh_token, user: userData, expires_in } = response;

      // Store tokens
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, access_token);

      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }

      // Store expiry time
      if (expires_in) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expires_in * 1000).toString());
      }

      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await authApi.signup(data);
      const { access_token, refresh_token, user: userData, expires_in } = response;

      // Store tokens
      localStorage.setItem(TOKEN_KEY, access_token);

      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }

      // Store expiry time
      if (expires_in) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expires_in * 1000).toString());
      }

      setUser(userData);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear tokens and user data
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setUser(null);
      navigate('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};