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
      const now = new Date();
      const exp = new Date(tokenExpiration);

      if (exp > now) {
        setToken(storedToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
      }
    }
  }, []);

  const login = (newToken: string, expiration: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiration', expiration);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    setToken(null);
    router.push('/auth'); // hoặc chuyển hướng sang trang login
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
