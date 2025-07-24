'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { BrowserInfo, SessionInfo } from '@/features/auth/auth.types';
import { AuthService } from '@/services/auth.service'; // ✅ Import AuthService

// ----------------------------
// Interfaces
// ----------------------------
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;

  browserName?: string;
  browserVersion?: string;
  os?: string;
  timezone?: string;
  language?: string;
  sessionId?: string;
  loginTime?: string;
  ipAddress?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  sessionInfo: SessionInfo | null;
  browserInfo: BrowserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, sessionInfo?: SessionInfo) => void;
  logout: () => Promise<void>; // ✅ Updated to async
  getBrowserSummary: () => string;
  getSessionDuration: () => string;
}

// ----------------------------
// Context
// ----------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------
// Provider
// ----------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Giải mã token và lấy thông tin user + thời hạn token
  const decodeToken = (token: string): (User & { exp?: number }) | null => {
    try {
      const decoded: any = jwtDecode(token);

      let browserInfoFromToken: BrowserInfo | null = null;
      try{
        if(decoded.browserInfo) {
          browserInfoFromToken = JSON.parse(decoded.browserInfo);
        }
      } catch (e) {
        console.warn('Failed to parse browser info from token:', e);
      }

      if (browserInfoFromToken) {
        setBrowserInfo(browserInfoFromToken);
      }

      return {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        phone: decoded.phone,
        address: decoded.address,
        exp: decoded.exp,

        browserName: decoded.browserName,
        browserVersion: decoded.browserVersion,
        os: decoded.os,
        timezone: decoded.timezone,
        language: decoded.language,
        sessionId: decoded.sessionId,
        loginTime: decoded.loginTime,
        ipAddress: decoded.ipAddress
      };
    } catch (err) {
      console.error('Invalid token:', err);
      return null;
    }
  };

  const login = (newToken: string, newSessionInfo?: SessionInfo) => {
    const userData = decodeToken(newToken);
    if (!userData || !userData.exp || userData.exp * 1000 < Date.now()) {
      logout();
      return;
    }
    const expirationDate = new Date(userData.exp * 1000).toISOString();

    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiration', expirationDate);

    if (newSessionInfo) {
      localStorage.setItem('sessionInfo', JSON.stringify(newSessionInfo));
      setSessionInfo(newSessionInfo);
    }

    setToken(newToken);
    setUser(userData as User);

    console.log('🔐 Authentication successful:', {
      user: userData.name,
      browser: userData.browserName,
      os: userData.os,
      sessionId: userData.sessionId
    });
  };

  // ✅ ENHANCED: Logout with server call
  const logout = async () => {
    let logoutSuccess = false;
    
    // ✅ Call server logout API first
    if (token) {
      try {
        const result = await AuthService.logout(token);
        console.log('🚪 Server logout successful:', result);
        logoutSuccess = result.isSuccess;
      } catch (error: any) {
        console.warn('⚠️ Server logout failed, proceeding with local logout:', error.message);
        // Continue with local logout even if server call fails
      }
    }

    // ✅ Log session analytics before clearing
    if (sessionInfo && user) {
      const sessionDuration = getSessionDuration();
      console.log('📊 Session ended:', {
        user: user.name,
        sessionId: user.sessionId,
        duration: sessionDuration,
        browser: user.browserName,
        serverLogout: logoutSuccess
      });
    }

    // ✅ Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('sessionInfo');
    setToken(null);
    setUser(null);
    setSessionInfo(null);
    setBrowserInfo(null);

    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
  };

   const getBrowserSummary = (): string => {
    if (user?.browserName && user?.os) {
      return `${user.browserName} on ${user.os}`;
    }
    if (browserInfo) {
      return `${browserInfo.browserName} on ${browserInfo.operatingSystem}`;
    }
    return 'Unknown Browser';
  };

  // ✅ Helper: Get session duration
  const getSessionDuration = (): string => {
    if (!user?.loginTime) return '0 minutes';
    
    try {
      const loginTime = new Date(user.loginTime);
      const now = new Date();
      const diffMs = now.getTime() - loginTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minutes`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      }
    } catch (e) {
      return 'Unknown duration';
    }
  };

  // Khôi phục token từ localStorage nếu còn hạn
  useEffect(() => {
    const validateToken = () => {
      try{
        const storedToken = localStorage.getItem('token');
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        const storedSessionInfo = localStorage.getItem('sessionInfo');

        if (storedToken && tokenExpiration) {
          const exp = new Date(tokenExpiration);
          if (!isNaN(exp.getTime()) && exp > new Date()) {
            let parsedSessionInfo: SessionInfo | undefined;
            try {
              if (storedSessionInfo) {
                parsedSessionInfo = JSON.parse(storedSessionInfo);
              }
            } catch (e) {
              console.warn('Failed to parse stored session info:', e);
            }

            login(storedToken, parsedSessionInfo);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Failed to validate token", error);
        // Có lỗi thì cũng coi như chưa đăng nhập
        logout();
      } finally {
        // QUAN TRỌNG: Dù thành công hay thất bại, cũng phải kết thúc trạng thái tải
        setLoading(false);
      }
    };

    validateToken();
    
  }, []);

  // Tự logout khi token hết hạn
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

  // Giá trị context được cung cấp cho toàn app
  const value: AuthContextType = {
    token,
    user,
    sessionInfo,
    browserInfo,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout, // ✅ Now async with server call
    getBrowserSummary,
    getSessionDuration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ----------------------------
// Hook tiện dùng
// ----------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};