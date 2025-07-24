import { BrowserInfo } from "@/utils/browserDetection";


export interface LoginData {
  usernameorEmail: string;
  password: string;
  rememberMe?: boolean;
  browserInfo?: BrowserInfo;
}

export interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  browserInfo?: BrowserInfo;
}

export interface ForgotPasswordData {
  usernameorEmail: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SessionInfo {
  sessionId: string;
  loginTime: string;
  ipAddress: string;
  browserInfo?: BrowserInfo;
}

export interface AuthResponse {
  token: string;
  role: number;
  sessionInfo?: SessionInfo;
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  errorMessage?: string;
  data?: T;
  message?: string;
}

export interface AnalyticsResponse {
  BrowserDistribution: Record<string, number>;
  OperatingSystemDistribution: Record<string, number>;
  ActiveSessionsLast30Minutes: number;
  TotalSessions: number;
  GeneratedAt: string;
}

export interface LogoutResponse {
  message: string;
  sessionId?: string;
  timestamp: string;
  isSuccess: boolean;
}

export type { BrowserInfo } from '@/utils/browserDetection';