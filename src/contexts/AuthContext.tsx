'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';
import { mockAuthApi } from '@/lib/mockApi';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, tenantId: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use mock API in production environment
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NEXT_PUBLIC_API_URL;
  const apiService = isProduction ? mockAuthApi : authApi;

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          // Auto-login with test credentials for development
          console.log('No token found, attempting auto-login...');
          const autoLoginSuccess = await login('admin@test.com', 'admin123', 'demo');
          if (autoLoginSuccess) {
            console.log('Auto-login successful');
          } else {
            console.log('Auto-login failed');
          }
          setLoading(false);
          return;
        }

        // Try to validate the token
        const response = await apiService.validate();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Token is invalid, try auto-login
          clearAuthToken();
          localStorage.removeItem('user');
          console.log('Token invalid, attempting auto-login...');
          const autoLoginSuccess = await login('admin@test.com', 'admin123', 'demo');
          if (autoLoginSuccess) {
            console.log('Auto-login successful after token validation failure');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthToken();
        localStorage.removeItem('user');
        // Try auto-login even on error
        try {
          const autoLoginSuccess = await login('admin@test.com', 'admin123', 'demo');
          if (autoLoginSuccess) {
            console.log('Auto-login successful after error');
          }
        } catch (autoLoginError) {
          console.error('Auto-login failed:', autoLoginError);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, tenantId: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password, tenantId });
      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};