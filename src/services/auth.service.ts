import { ENV } from '@/config/env';
import {
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  ApiResponse,
  AnalyticsResponse,
  LogoutResponse  // ✅ Import LogoutResponse type
} from '@/features/auth/auth.types';
import { getBrowserInfo } from '@/utils/browserDetection';

export const AuthService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const loginPayload = {
      ...data,
      browserInfo: data.browserInfo || getBrowserInfo()
    };

    console.log('🚀 Login with browser info:', loginPayload.browserInfo);

    const response = await fetch(`${ENV.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    const result = await response.json();
    
    // Log successful login with session info
    if (result.sessionInfo) {
      console.log('✅ Login successful. Session info:', result.sessionInfo);
    }

    return result;
  },

  // ✅ NEW: Logout method
  logout: async (token: string): Promise<LogoutResponse> => {
    try {
      const response = await fetch(`${ENV.apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Logout failed');
      }

      console.log('✅ Server logout successful:', result);
      return result;
    } catch (error: any) {
      console.warn('❌ Logout API error:', error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<ApiResponse> => {
    const registerPayload = {
      ...data,
      browserInfo: data.browserInfo || getBrowserInfo()
    };

    const response = await fetch(`${ENV.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });

    const result = await response.json();
    
    if (result.isSuccess) {
      console.log('✅ Registration successful');
    }

    return result;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    const response = await fetch(`${ENV.apiUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return await response.json();
  },

  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    const response = await fetch(`${ENV.apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: data.token,
        newPassword: data.newPassword
      })
    });

    return await response.json();
  },

  getAnalytics: async (token: string): Promise<AnalyticsResponse> => {
    const response = await fetch(`${ENV.apiUrl}/auth/analytics`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    return await response.json();
  },

  // ✅ Method: Manual browser info collection (for testing)
  collectBrowserInfo: () => {
    return getBrowserInfo();
  }
};