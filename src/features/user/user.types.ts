export interface User {
    userId: number,
    username: string,
    email: string;
    fullName: string;
    phone: string;
    address: string;
    roleId: number;  
    roleName: string;
    isActive: boolean;
    createDate: string;
}

export interface CreateUserRequestDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  roleId: number;
  isActive: boolean;
}

export interface AdminUpdateUserRequestDTO {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  roleId: number;
  isActive: boolean;
}

export interface AdminResetPasswordRequestDTO {
  targetUserId: number;
  newPassword: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface ProfileData {
  fullName: string;
  phone: string;
  address: string;
  username?: string;
  email?: string;
}

export interface ProfileErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}