'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { AdminUpdateUserRequestDTO, User } from './user.types';
import { 
  validateEmail, 
  validatePhone, 
  validateFullName, 
  validateAddress 
} from '@/utils/validation';
import toast from 'react-hot-toast'; // ✅ Import react-hot-toast

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userData: AdminUpdateUserRequestDTO) => Promise<void>;
}

const getRoleIdFromName = (roleName: string): number => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
      return 1;
    case 'staff':
      return 2;
    case 'user':
      return 3;
    default:
      return 3; // Default to User
  }
};

const EditUserDialog: React.FC<Props> = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AdminUpdateUserRequestDTO>({
    userId: 0,
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
    roleId: 3,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  // ✅ Xóa error state vì dùng toast
  // const [error, setError] = useState<string | null>(null);
  
  // ✅ Validation error states
  const [validationErrors, setValidationErrors] = useState<{
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    address?: string | null;
  }>({});

  const theme = useTheme();

  useEffect(() => {
    if (user) {
      // Xử lý roleId: ưu tiên roleId, nếu không có thì convert từ roleName
      let resolvedRoleId: number;
      
      if (user.roleId !== null && user.roleId !== undefined) {
        resolvedRoleId = user.roleId;
      } else if (user.roleName) {
        resolvedRoleId = getRoleIdFromName(user.roleName);
        console.log(`🔴 Converted roleName "${user.roleName}" to roleId ${resolvedRoleId}`);
      } else {
        resolvedRoleId = 3; // Default to User
      }

      console.log('🔴 Final resolved roleId:', resolvedRoleId);

      setFormData({
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        roleId: resolvedRoleId,
        isActive: user.isActive
      });
    } else {
      // Reset form khi không có user
      setFormData({
        userId: 0,
        username: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
        roleId: 3,
        isActive: true
      });
    }
    
    // ✅ Reset validation errors when user changes
    setValidationErrors({});
  }, [user]);

  // ✅ Validation form
  const validateForm = (): boolean => {
    const errors: {
      email?: string | null;
      fullName?: string | null;
      phone?: string | null;
      address?: string | null;
    } = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    if (formData.address) {
      const addressError = validateAddress(formData.address);
      if (addressError) errors.address = addressError;
    }
    
    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleChange = (field: keyof AdminUpdateUserRequestDTO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;
    
    // ✅ Phone normalization
    if (field === 'phone') {
      value = value.replace(/\s|-/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // ✅ Clear validation error when user types
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // ✅ Xóa setError(null)
    
    // ✅ Validation before submit
    if (!validateForm()) {
      // ✅ Hiển thị toast warning cho validation errors
      toast.error('⚠️ Vui lòng kiểm tra lại thông tin đã nhập', {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
        },
      });
      return;
    }

    setLoading(true);
    
    // ✅ Hiển thị loading toast
    const loadingToast = toast.loading('Đang cập nhật thông tin...', {
      style: {
        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        color: '#fff',
        fontWeight: '600',
        fontSize: '14px',
        padding: '12px 20px',
        borderRadius: '10px',
      },
    });
    
    try {
      await onSubmit(formData);
      
      setValidationErrors({});
      
      // ✅ Dismiss loading toast và hiển thị success toast
      toast.dismiss(loadingToast);
      toast.success('🎉 Cập nhật thông tin thành công!', {
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
      
      onClose();
    } catch (err) {
      // ✅ Dismiss loading toast và hiển thị error toast
      toast.dismiss(loadingToast);
      
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật';
      
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

  const hasValidationErrors = Object.values(validationErrors).some(error => !!error);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Chỉnh sửa người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cập nhật thông tin tài khoản: {formData.username}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ pt: 2 }}>
          {/* ✅ Xóa Alert component vì đã dùng toast */}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                fullWidth
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                error={!!validationErrors.fullName}
                helperText={validationErrors.fullName}
                fullWidth
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số điện thoại"
                value={formData.phone}
                onChange={handleChange('phone')}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                fullWidth
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Địa chỉ"
                value={formData.address}
                onChange={handleChange('address')}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  label="Vai trò"
                  value={formData.roleId ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      roleId: Number(e.target.value)
                    }))
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Staff</MenuItem>
                  <MenuItem value={3}>User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked
                      }))
                    }
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Hoạt động"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3 
            }}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || hasValidationErrors}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;