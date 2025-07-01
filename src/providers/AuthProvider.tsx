'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Staff' | 'User';
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, expiration: string, user: User) => void;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    const storedUser = localStorage.getItem('user');

    if (storedToken && tokenExpiration) {
      const now = new Date();
      const exp = new Date(tokenExpiration);

      if (exp > now) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } else {
        localStorage.clear();
      }
    }
  }, []);

  const login = (newToken: string, expiration: string, user: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiration', expiration);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/auth');
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
