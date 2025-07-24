'use client';

import { useState } from 'react';
import { ChangePasswordErrors, ChangePasswordForm } from './user.types';
import { useAuth } from '@/providers/AuthProvider';
import { ENV } from '@/config/env';
import toast from 'react-hot-toast';

export function useChangePassword() {
  const { token } = useAuth();

  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [loading, setLoading] = useState(false);
  // const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    // setAlert(null);
  };

  const validate = (): boolean => {
    const newErrors: ChangePasswordErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!formData.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới phải tối thiểu 6 ký tự';
    if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

     const loadingToast = toast.loading('Đang xử lý đổi mật khẩu...');

    try {
      const response = await fetch(`${ENV.apiUrl}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể đổi mật khẩu');
      }

      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    //   setAlert({ type: 'success', message: 'Đổi mật khẩu thành công!' });
    // } catch (err) {
    //   setAlert({ type: 'error', message: err instanceof Error ? err.message : 'Đã xảy ra lỗi' });
    // } finally {
    //   setLoading(false);
    // }
      toast.dismiss(loadingToast);
      toast.success('🎉 Đổi mật khẩu thành công!', {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff',
          fontWeight: '600',
          fontSize: '15px',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      });
      
    } catch (err) {
      // ✅ Dismiss loading toast và hiển thị error toast
      toast.dismiss(loadingToast);
      
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      
      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: '#fff',
          fontWeight: '600',
          fontSize: '15px',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    // alert,
    handleChange,
    handleSubmit
  };
}
