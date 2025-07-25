'use client';

import { useEffect, useState } from 'react';
import { ProfileData, ProfileErrors } from './user.types';
import { useAuth } from '@/providers/AuthProvider';
import { validateFullName, validatePhone, validateAddress } from '@/utils/validation';
import { apiClient, BrowserFingerprintMismatchError } from '@/services/apiClient'; // ✅ Import apiClient
import toast from 'react-hot-toast';

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

  // ✅ SIMPLIFIED: Fetch user profile
  const fetchUserProfile = async () => {
    if (!isAuthenticated || !token) {
      console.log('👤 Not authenticated, skipping profile fetch');
      setLoadingProfile(false);
      if (!authLoading) {
        toast.error('Vui lòng đăng nhập để tiếp tục', {
          icon: '🔒',
          duration: 4000,
        });
      }
      return;
    }

    console.log('📡 Fetching user profile...');
    setLoadingProfile(true);

    const loadingToast = toast.loading('Đang tải thông tin người dùng...', {
      icon: '📄',
    });

    try {
      // ✅ SIMPLIFIED: No manual headers, no manual 401 handling
      const data = await apiClient.get<ProfileData>('/user/profile', token);
      
      console.log('✅ Profile loaded successfully');
      setFormData(data);
      setOriginalData(data);
      
      toast.dismiss(loadingToast);
      toast.success('Tải thông tin thành công', {
        icon: '✅',
        duration: 2000,
      });

    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error);
      toast.dismiss(loadingToast);
      
      // ✅ apiClient already handled 401 errors automatically
      // Only business logic errors reach here
      if (!(error instanceof BrowserFingerprintMismatchError)) {
        toast.error(error.message || 'Lỗi khi tải thông tin người dùng', {
          icon: '❌',
          duration: 5000,
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: ProfileErrors = {};
    
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
      console.log('❌ Validation failed:', newErrors);
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập', {
        icon: '⚠️',
        duration: 3000,
      });
    }
    
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\s|-/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name as keyof ProfileErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ SIMPLIFIED: Handle submit
  const handleSubmit = async () => {
    if (!token || !validate()) return;

    setLoading(true);
    
    const loadingToast = toast.loading('Đang cập nhật thông tin...', {
      icon: '💾',
    });

    try {
      // ✅ SIMPLIFIED: No manual headers, no manual 401 handling
      await apiClient.put('/user/profile', formData, token);

      setOriginalData(formData);
      toast.dismiss(loadingToast);
      
      toast.success('Cập nhật thông tin thành công!', {
        icon: '🎉',
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
        },
      });
      
      console.log('✅ Profile updated successfully');

    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      toast.dismiss(loadingToast);
      
      // ✅ apiClient already handled 401 errors automatically
      if (!(error instanceof BrowserFingerprintMismatchError)) {
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', {
          icon: '🚨',
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    
    toast.success('Đã khôi phục thông tin ban đầu', {
      icon: '↩️',
      duration: 2000,
    });
  };

  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      authLoading, 
      isAuthenticated, 
      hasToken: !!token 
    });

    if (!authLoading) {
      if (isAuthenticated && token) {
        fetchUserProfile();
      } else {
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