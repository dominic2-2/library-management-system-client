'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  Lock, 
  Visibility, 
  VisibilityOff, 
  VpnKey,
  CheckCircleOutline,
  ErrorOutline 
} from '@mui/icons-material';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { ResetPasswordData } from '@/features/auth/auth.types';
import { validatePassword } from '@/utils/validation'; // ✅ Import validation

const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // ✅ Validation error states - Allow both null and undefined
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string | null;
    confirmPassword?: string | null;
  }>({});
  
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const passwordStrength = getPasswordStrength(formData.newPassword);

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

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    } else {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
    }
  }, [searchParams]);

  const handleChange =
    (key: keyof ResetPasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, [key]: value }));
      setError('');
      setSuccess('');
      
      // ✅ Real-time validation
      if (key === 'newPassword') {
        const passwordError = validatePassword(value);
        setValidationErrors(prev => ({ 
          ...prev, 
          newPassword: passwordError 
        }));
        
        // Check confirm password match if it exists
        if (formData.confirmPassword) {
          const confirmError = value !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp' : null;
          setValidationErrors(prev => ({ 
            ...prev, 
            confirmPassword: confirmError 
          }));
        }
      }
      
      if (key === 'confirmPassword') {
        const confirmError = value !== formData.newPassword ? 'Mật khẩu xác nhận không khớp' : null;
        setValidationErrors(prev => ({ 
          ...prev, 
          confirmPassword: confirmError 
        }));
      }
    };

  // ✅ Validation form
  const validateForm = (): boolean => {
    const errors: { newPassword?: string | null; confirmPassword?: string | null } = {};
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) errors.newPassword = passwordError;
    
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { token, newPassword, confirmPassword } = formData;

    if (!token || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    // ✅ Validation trước khi submit
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({ token, newPassword, confirmPassword });
      if (res.message) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(res.errorMessage || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => !!error);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Card
            elevation={20}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                p: 3,
                textAlign: 'center'
              }}
            >
              <VpnKey sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Đặt lại mật khẩu
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Tạo mật khẩu mới cho tài khoản của bạn
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Description */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Vui lòng nhập mật khẩu mới. Mật khẩu phải đảm bảo tính bảo mật cao.
                </Typography>
              </Box>

              {/* Alerts */}
              {error && (
                <Alert 
                  severity="error" 
                  icon={<ErrorOutline />}
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    background: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                  }}
                >
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert 
                  severity="success" 
                  icon={<CheckCircleOutline />}
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    background: alpha(theme.palette.success.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    required
                    disabled={loading}
                    error={!!validationErrors.newPassword} // ✅ Error state
                    helperText={validationErrors.newPassword} // ✅ Error message
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword(!showPassword)} 
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
                  {formData.newPassword && (
                    <Box sx={{ mt: -2, mb: 1 }}>
                      {/* Strength Bar */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
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
                          variant="body2" 
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

                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    disabled={loading}
                    error={!!validationErrors.confirmPassword} // ✅ Error state
                    helperText={validationErrors.confirmPassword} // ✅ Error message
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowConfirm(!showConfirm)} 
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

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || hasValidationErrors} // ✅ Disable nếu có validation error
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <VpnKey />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        transform: loading ? 'none' : 'translateY(-2px)',
                        boxShadow: loading ? 'none' : `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.primary.main, 0.6)
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
                  </Button>
                </Stack>
              </Box>

              {/* Password Requirements - Updated */}
              <Box 
                sx={{ 
                  mt: 4, 
                  p: 3, 
                  background: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  🔒 Để có mật khẩu mạnh, hãy bao gồm:
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  • Ít nhất 8 ký tự (không quá 50 ký tự)<br/>
                  • Chữ hoa và chữ thường<br/>
                  • Ít nhất 1 số<br/>
                  • Ký tự đặc biệt (!@#$%^&*...)<br/>
                  • Không được chứa khoảng trắng
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;