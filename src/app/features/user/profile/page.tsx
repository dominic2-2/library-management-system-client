'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';
import { ENV } from '@/config/env';

interface UpdateProfileProps {
  userId?: string;
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  username?: string;
  email?: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ userId }) => {
  const { token, isAuthenticated, logout } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    username: '',
    email: ''
  });

  const [originalData, setOriginalData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    username: '',
    email: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !token) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Vui lòng đăng nhập để tiếp tục'
        });
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`${ENV.apiUrl}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (response.ok) {
          const userData = await response.json();
          const profileData: FormData = {
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            address: userData.address || '',
            username: userData.username || '',
            email: userData.email || ''
          };
          setFormData(profileData);
          setOriginalData(profileData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Lỗi khi tải thông tin người dùng');
        }
      } catch (error) {
        console.error('Lỗi khi fetch profile:', error);
        setAlert({
          show: true,
          type: 'error',
          message: 'Không thể tải thông tin người dùng'
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [userId, token, isAuthenticated, logout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setAlert({ show: false, type: 'info', message: '' });

    try {
      const response = await fetch(`${ENV.apiUrl}/features/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setOriginalData(formData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Cập nhật thông tin thành công!'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setAlert({ show: false, type: 'info', message: '' });
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loadingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardHeader
        avatar={<PersonIcon color="primary" />}
        title={<Typography variant="h5">Cập nhật thông tin cá nhân</Typography>}
      />
      <CardContent>
        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert({ show: false, type: 'info', message: '' })}>
            {alert.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Thông tin chỉ hiển thị */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email || ''}
                disabled
              />
            </Grid>

            {/* Thông tin chỉnh sửa */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!errors.address}
                helperText={errors.address}
                required
                disabled={loading}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button type="button" variant="outlined" disabled={loading || !hasChanges} onClick={handleReset}>
                  Hủy
                </Button>
                <Button type="submit" variant="contained" disabled={loading || !hasChanges} startIcon={loading && <CircularProgress size={20} />}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UpdateProfile;
