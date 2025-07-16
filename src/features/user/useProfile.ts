'use client';

import { useEffect, useState } from 'react';
import { ProfileData, ProfileErrors, AlertState } from './user.types';
import { ENV } from '@/config/env';
import { useAuth } from '@/providers/AuthProvider';

export function useProfile() {
  const { token, isAuthenticated, logout, loading: authLoading } = useAuth(); // ✅ Thêm authLoading

  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    phone: '',
    address: '',
    username: '',
    email: ''
  });

  const [originalData, setOriginalData] = useState<ProfileData>(formData);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [alert, setAlert] = useState<AlertState | null>(null);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const fetchUserProfile = async () => {
    // ✅ Kiểm tra auth state trước khi fetch
    if (!isAuthenticated || !token) {
      console.log('👤 Not authenticated, skipping profile fetch');
      setLoadingProfile(false);
      if (!authLoading) { // Chỉ hiện error khi auth đã load xong
        setAlert({ show: true, type: 'error', message: 'Vui lòng đăng nhập để tiếp tục' });
      }
      return;
    }

    console.log('📡 Fetching user profile...');
    setLoadingProfile(true);

    try {
      const response = await fetch(`${ENV.apiUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('🔒 Unauthorized, logging out');
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile loaded successfully');
        setFormData(data);
        setOriginalData(data);
        setAlert(null); // Clear any previous errors
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể tải dữ liệu người dùng');
      }
    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error);
      setAlert({ 
        show: true, 
        type: 'error', 
        message: error.message || 'Lỗi khi tải thông tin người dùng' 
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: ProfileErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống';
    else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!token || !validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${ENV.apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setOriginalData(formData);
        setAlert({ show: true, type: 'success', message: 'Cập nhật thành công' });
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      setAlert({ 
        show: true, 
        type: 'error', 
        message: error.message || 'Có lỗi xảy ra khi cập nhật' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setAlert(null);
  };

  // ✅ FIX: useEffect phụ thuộc vào auth state
  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      authLoading, 
      isAuthenticated, 
      hasToken: !!token 
    });

    // Chỉ fetch khi auth đã load xong và user đã authenticated
    if (!authLoading) {
      if (isAuthenticated && token) {
        fetchUserProfile();
      } else {
        // Không authenticated -> clear loading state
        setLoadingProfile(false);
      }
    }
  }, [authLoading, isAuthenticated, token]); // ✅ Dependencies đầy đủ

  return {
    formData,
    errors,
    alert,
    loading,
    loadingProfile: loadingProfile || authLoading, // ✅ Loading khi auth chưa sẵn sàng
    hasChanges,
    handleChange,
    handleSubmit,
    handleReset,
    setAlert
  };
}