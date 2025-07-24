'use client';

import { useEffect, useState } from 'react';
import { ProfileData, ProfileErrors } from './user.types';
import { ENV } from '@/config/env';
import { useAuth } from '@/providers/AuthProvider';
import { validateFullName, validatePhone, validateAddress } from '@/utils/validation';
import toast from 'react-hot-toast'; // ✅ Import toast

export function useProfile() {
  const { token, isAuthenticated, logout, loading: authLoading } = useAuth();

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

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const fetchUserProfile = async () => {
    // ✅ Kiểm tra auth state trước khi fetch
    if (!isAuthenticated || !token) {
      console.log('👤 Not authenticated, skipping profile fetch');
      setLoadingProfile(false);
      if (!authLoading) {
        // ✅ Toast thay vì alert
        toast.error('Vui lòng đăng nhập để tiếp tục', {
          icon: '🔒',
          duration: 4000,
        });
      }
      return;
    }

    console.log('📡 Fetching user profile...');
    setLoadingProfile(true);

    // ✅ Loading toast
    const loadingToast = toast.loading('Đang tải thông tin người dùng...', {
      icon: '📄',
    });

    try {
      const response = await fetch(`${ENV.apiUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('🔒 Unauthorized, logging out');
        toast.dismiss(loadingToast);
        toast.error('Phiên đăng nhập đã hết hạn', {
          icon: '⏰',
          duration: 4000,
        });
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile loaded successfully');
        setFormData(data);
        setOriginalData(data);
        
        // ✅ Success toast
        toast.dismiss(loadingToast);
        toast.success('Tải thông tin thành công', {
          icon: '✅',
          duration: 2000,
        });
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể tải dữ liệu người dùng');
      }
    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error);
      toast.dismiss(loadingToast);
      
      // ✅ Error toast
      toast.error(error.message || 'Lỗi khi tải thông tin người dùng', {
        icon: '❌',
        duration: 5000,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // ✅ Enhanced validation using utils functions
  const validate = (): boolean => {
    const newErrors: ProfileErrors = {};
    
    // Validate full name
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    
    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // Validate address
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
      console.log('❌ Validation failed:', newErrors);
      // ✅ Validation error toast
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập', {
        icon: '⚠️',
        duration: 3000,
      });
    }
    
    return isValid;
  };

  // ✅ Enhanced handleChange with phone normalization and real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    // ✅ Normalize phone input - remove spaces and dashes
    if (name === 'phone') {
      processedValue = value.replace(/\s|-/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // ✅ Real-time validation - clear error when user starts typing
    if (errors[name as keyof ProfileErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!token || !validate()) return;

    setLoading(true);
    
    // ✅ Loading toast for submit
    const loadingToast = toast.loading('Đang cập nhật thông tin...', {
      icon: '💾',
    });

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
        toast.dismiss(loadingToast);
        toast.error('Phiên đăng nhập đã hết hạn', {
          icon: '⏰',
          duration: 4000,
        });
        logout();
        return;
      }

      if (response.ok) {
        setOriginalData(formData);
        toast.dismiss(loadingToast);
        
        // ✅ Success toast với animation
        toast.success('Cập nhật thông tin thành công!', {
          icon: '🎉',
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
          },
        });
        
        console.log('✅ Profile updated successfully');
      } else {
        const err = await response.json().catch(() => ({}));
        toast.dismiss(loadingToast);
        
        // ✅ Server error toast
        toast.error(err.message || 'Cập nhật thất bại', {
          icon: '❌',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      toast.dismiss(loadingToast);
      
      // ✅ Network error toast
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', {
        icon: '🚨',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    
    // ✅ Reset confirmation toast
    toast.success('Đã khôi phục thông tin ban đầu', {
      icon: '↩️',
      duration: 2000,
    });
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
  }, [authLoading, isAuthenticated, token]);

  return {
    formData,
    errors,
    loading,
    loadingProfile: loadingProfile || authLoading,
    hasChanges,
    handleChange,
    handleSubmit,
    handleReset,
  };
}