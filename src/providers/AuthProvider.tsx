'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, expiration: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    if (storedToken && tokenExpiration) {
      const exp = new Date(tokenExpiration);
      if (!isNaN(exp.getTime()) && exp > new Date()) {
        setToken(storedToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      const expiration = localStorage.getItem('tokenExpiration');
      if (expiration) {
        const timeout = new Date(expiration).getTime() - Date.now();
        if (timeout > 0) {
          const timer = setTimeout(() => logout(), timeout);
          return () => clearTimeout(timer);
        } else {
          logout();
        }
      }
    }
  }, [token]);

  const login = (newToken: string, expiration: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiration', expiration);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    setToken(null);
    if (typeof window !== 'undefined') {
      router.push('/auth');
    }
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
