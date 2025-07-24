import { ENV } from '@/config/env';
import {
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  ApiResponse,
  AnalyticsResponse,
  LogoutResponse
} from '@/features/auth/auth.types';
import { getBrowserInfo } from '@/utils/browserDetection';
import { apiClient } from './apiClient'; // ✅ Import apiClient

export const AuthService = {
  // ✅ Login with automatic browser fingerprint headers
  login: async (data: LoginData): Promise<AuthResponse> => {
    const loginPayload = {
      ...data,
      browserInfo: data.browserInfo || getBrowserInfo()
    };
    
    console.log('🚀 Login with browser info:', loginPayload.browserInfo);
    
    // ✅ apiClient automatically adds browser fingerprint headers
    const result = await apiClient.post<AuthResponse>('/auth/login', loginPayload);
    
    if (result.sessionInfo) {
      console.log('✅ Login successful. Session info:', result.sessionInfo);
    }
    
    return result;
  },

  // ✅ Logout with automatic browser fingerprint headers
  logout: async (token: string): Promise<LogoutResponse> => {
    try {
      // ✅ apiClient automatically adds browser fingerprint headers
      const result = await apiClient.post<LogoutResponse>('/auth/logout', {}, token);
      
      console.log('✅ Server logout successful:', result);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn('❌ Logout API error:', errorMessage);
      throw error;
    }
  },

  // ✅ Register with automatic browser fingerprint headers
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const registerPayload = {
      ...data,
      browserInfo: data.browserInfo || getBrowserInfo()
    };
    
    // ✅ apiClient automatically adds browser fingerprint headers
    const result = await apiClient.post<ApiResponse>('/auth/register', registerPayload);
    
    if (result.isSuccess) {
      console.log('✅ Registration successful');
    }
    
    return result;
  },

  // ✅ Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/forgot-password', data);
  },

  // ✅ Reset password
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/reset-password', {
      token: data.token,
      newPassword: data.newPassword
    });
  },

  // ✅ Get analytics with automatic browser fingerprint headers
  getAnalytics: async (token: string): Promise<AnalyticsResponse> => {
    // ✅ This will automatically include browser headers for middleware validation
    return apiClient.get<AnalyticsResponse>('/auth/analytics', token);
  },

  // ✅ Manual browser info collection (for testing)
  collectBrowserInfo: () => {
    return getBrowserInfo();
  }
};