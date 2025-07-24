'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { CreateUserRequestDTO } from './user.types';
import { 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validatePhone, 
  validateFullName, 
  validateAddress 
} from '@/utils/validation';
import toast from 'react-hot-toast'; // ✅ Import react-hot-toast

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserRequestDTO) => Promise<void>;
}

const CreateUserDialog: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateUserRequestDTO>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    roleId: 3,
    isActive: true
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ✅ Xóa error state vì dùng toast
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ Validation error states
  const [validationErrors, setValidationErrors] = useState<{
    username?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    fullName?: string | null;
    phone?: string | null;
    address?: string | null;
  }>({});

  const theme = useTheme();

  // ✅ Password strength checker
  type PasswordLevel = 'weak' | 'medium' | 'strong';
  
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    
    const level: PasswordLevel = strength <= 2 ? 'weak' : strength <= 4 ? 'medium' : 'strong';
    
    return {
      score: strength,
      checks,
      level
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const strengthColor: Record<PasswordLevel, string> = {
    weak: theme.palette.error.main,
    medium: theme.palette.warning.main,
    strong: theme.palette.success.main
  };

  const strengthText: Record<PasswordLevel, string> = {
    weak: 'Yếu',
    medium: 'Trung bình', 
    strong: 'Mạnh'
  };

  // ✅ Validation form
  const validateForm = (): boolean => {
    const errors: {
      username?: string | null;
      email?: string | null;
      password?: string | null;
      confirmPassword?: string | null;
      fullName?: string | null;
      phone?: string | null;
      address?: string | null;
    } = {};
    
    const usernameError = validateUsername(formData.username);
    if (usernameError) errors.username = usernameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
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

  const handleChange = (field: keyof CreateUserRequestDTO) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    // ✅ Phone normalization
    if (field === 'phone') {
      value = value.replace(/\s|-/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // ✅ Clear validation error when user types
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const loadingToast = toast.loading('Đang tạo người dùng...', {
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
      
      // ✅ Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        roleId: 3,
        isActive: true
      });
      setConfirmPassword('');
      setValidationErrors({});
      
      // ✅ Dismiss loading toast và hiển thị success toast
      toast.dismiss(loadingToast);
      toast.success('🎉 Tạo người dùng thành công!', {
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
      
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo người dùng';
      
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
            Tạo người dùng mới
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Điền thông tin để tạo tài khoản người dùng mới
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ pt: 2 }}>
          {/* ✅ Xóa Alert component vì đã dùng toast */}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange('username')}
                error={!!validationErrors.username}
                helperText={validationErrors.username}
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
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                fullWidth
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(prev => !prev)} 
                        edge="end"
                        disabled={loading}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {/* ✅ Password Strength Indicator */}
              {formData.password && (
                <Box sx={{ mt: 1 }}>
                  {/* Strength Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                      Độ mạnh:
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Box
                          key={level}
                          sx={{
                            flex: 1,
                            height: 3,
                            borderRadius: 1,
                            bgcolor: passwordStrength.score >= level 
                              ? strengthColor[passwordStrength.level]
                              : alpha(theme.palette.grey[300], 0.5),
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: strengthColor[passwordStrength.level],
                        fontWeight: 600,
                        minWidth: 'fit-content'
                      }}
                    >
                      {strengthText[passwordStrength.level]}
                    </Typography>
                  </Box>

                  {/* Checklist */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries({
                      length: '8+ ký tự',
                      uppercase: 'Chữ hoa',
                      lowercase: 'Chữ thường',
                      number: 'Số',
                      special: 'Đặc biệt'
                    }).map(([key, label]) => (
                      <Box 
                        key={key}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.3,
                          fontSize: '0.75rem'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                              ? theme.palette.success.main
                              : alpha(theme.palette.grey[400], 0.5),
                            transition: 'all 0.2s ease'
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                              ? theme.palette.success.main
                              : theme.palette.text.secondary,
                            fontSize: '0.7rem'
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                fullWidth
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowConfirmPassword(prev => !prev)} 
                        edge="end"
                        disabled={loading}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
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
            
            <Grid item xs={12}>
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
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={formData.roleId}
                  label="Vai trò"
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: Number(e.target.value) }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Staff</MenuItem>
                  <MenuItem value={3}>User</MenuItem>
                </Select>
              </FormControl>
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
            {loading ? 'Đang tạo...' : 'Tạo người dùng'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserDialog;