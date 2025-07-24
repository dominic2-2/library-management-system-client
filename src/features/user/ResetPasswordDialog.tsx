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
  IconButton,
  InputAdornment,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AdminResetPasswordRequestDTO, User } from './user.types';
import { validatePassword } from '@/utils/validation';
import toast from 'react-hot-toast'; // ✅ Import react-hot-toast

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (resetData: AdminResetPasswordRequestDTO) => Promise<void>;
}

const ResetPasswordDialog: React.FC<Props> = ({ open, user, onClose, onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // ✅ Xóa error state vì dùng toast
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ Validation error states
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string | null;
    confirmPassword?: string | null;
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

  const passwordStrength = getPasswordStrength(newPassword);

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
      newPassword?: string | null;
      confirmPassword?: string | null;
    } = {};
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) errors.newPassword = passwordError;
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (validationErrors.newPassword) {
      setValidationErrors(prev => ({ ...prev, newPassword: null }));
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
      toast.error('⚠️ Vui lòng kiểm tra lại thông tin mật khẩu', {
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

    if (!user) return;

    setLoading(true);
    
    // ✅ Hiển thị loading toast
    const loadingToast = toast.loading('Đang đặt lại mật khẩu...', {
      style: {
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        color: '#fff',
        fontWeight: '600',
        fontSize: '14px',
        padding: '12px 20px',
        borderRadius: '10px',
      },
    });

    try {
      await onSubmit({ targetUserId: user.userId, newPassword });
      
      // ✅ Reset form
      setNewPassword('');
      setConfirmPassword('');
      setValidationErrors({});
      
      // ✅ Dismiss loading toast và hiển thị success toast
      toast.dismiss(loadingToast);
      toast.success('🔐 Đặt lại mật khẩu thành công!', {
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
      
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đặt lại mật khẩu';
      
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Đặt lại mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tạo mật khẩu mới cho: {user?.fullName}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ pt: 2 }}>
          {/* ✅ Xóa Alert component vì đã dùng toast */}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={handlePasswordChange}
                error={!!validationErrors.newPassword}
                helperText={validationErrors.newPassword}
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
                        onClick={() => setShowPassword((prev) => !prev)} 
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
              {newPassword && (
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
                            height: 4,
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries({
                      length: 'Ít nhất 8 ký tự',
                      uppercase: 'Chữ hoa',
                      lowercase: 'Chữ thường', 
                      number: 'Số',
                      special: 'Ký tự đặc biệt'
                    }).map(([key, label]) => (
                      <Box 
                        key={key}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
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
                              : theme.palette.text.secondary
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
            
            <Grid item xs={12}>
              <TextField
                label="Xác nhận mật khẩu"
                type={showConfirm ? 'text' : 'password'}
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
                        onClick={() => setShowConfirm((prev) => !prev)} 
                        edge="end"
                        disabled={loading}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
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
              background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`
              },
              '&:disabled': {
                background: alpha(theme.palette.warning.main, 0.6)
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Đang đặt lại...' : 'Xác nhận đặt lại'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPasswordDialog;