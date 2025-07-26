'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import { 
  Email, 
  LockReset, 
  ArrowBack,
  Send,
  CheckCircleOutline,
  ErrorOutline,
  Security,
  Timer,
  Lock,
  Visibility,
  VisibilityOff,
  VpnKey,
  Refresh
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { validateUsernameOrEmail, validatePassword } from '@/utils/validation';
import { ENV } from '@/config/env';

// Types based on your backend
interface ForgotPasswordData {
  UsernameorEmail: string;
}

interface VerifyOtpData {
  Email: string;
  OtpCode: string;
}

interface ResetPasswordWithOtpData {
  Email: string;
  OtpCode: string;
  NewPassword: string;
  ConfirmPassword: string;
}

const ForgotPasswordOTPPage: React.FC = () => {
  // Step management
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  
  // Form data
  const [formData, setFormData] = useState({
    usernameorEmail: '',
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // OTP timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    usernameorEmail?: string;
    otpCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();
  const theme = useTheme();

  // Timer effect for OTP countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft === 1) setCanResend(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validation functions
  const validateOTP = (otp: string): string | null => {
    if (!otp.trim()) return 'Mã OTP không được để trống';
    if (!/^\d{6}$/.test(otp)) return 'Mã OTP phải là 6 chữ số';
    return null;
  };

  // Password strength checker
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
    
    return { score: strength, checks, level };
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

  // Handle input changes with validation
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');

    // Real-time validation
    if (field === 'usernameorEmail' && value.trim()) {
      const validationResult = validateUsernameOrEmail(value);
      setValidationErrors(prev => ({ ...prev, usernameorEmail: validationResult || undefined }));
    } else if (field === 'otpCode' && value.trim()) {
      const otpError = validateOTP(value);
      setValidationErrors(prev => ({ ...prev, otpCode: otpError || undefined }));
    } else if (field === 'newPassword') {
      const passwordError = validatePassword(value);
      setValidationErrors(prev => ({ ...prev, newPassword: passwordError || undefined }));
      
      // Check confirm password match if it exists
      if (formData.confirmPassword) {
        const confirmError = value !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp' : undefined;
        setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      }
    } else if (field === 'confirmPassword') {
      const confirmError = value !== formData.newPassword ? 'Mật khẩu xác nhận không khớp' : undefined;
      setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    } else {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = validateUsernameOrEmail(formData.usernameorEmail);
    if (validationResult) {
      setValidationErrors({ usernameorEmail: validationResult });
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.forgotPassword({ usernameorEmail: formData.usernameorEmail });
      
      if (res.message || res.isSuccess !== false) {
        setSuccess('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!');
        setStep(2);
        setTimeLeft(600); // 10 minutes
        setCanResend(false);
        setError('');
        setValidationErrors({});
      } else {
        setError(res.errorMessage || 'Có lỗi xảy ra khi gửi OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpError = validateOTP(formData.otpCode);
    if (otpError) {
      setValidationErrors({ otpCode: otpError });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${ENV.apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Email: formData.usernameorEmail, 
          OtpCode: formData.otpCode 
        }),
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        setSuccess(data.data.message || 'OTP xác thực thành công!');
        setStep(3);
        setError('');
        setValidationErrors({});
      } else {
        setError(data.errorMessage || 'Mã OTP không hợp lệ');
      }
    } catch (err: any) {
      setError('Lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.newPassword);
    const confirmError = formData.newPassword !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp' : null;

    if (passwordError || confirmError) {
      setValidationErrors({ 
        newPassword: passwordError || undefined,
        confirmPassword: confirmError || undefined
      });
      return;
    }

    setLoading(true);
    try {
      // Call reset password with OTP API
      const response = await fetch(`${ENV.apiUrl}/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Email: formData.usernameorEmail, 
          OtpCode: formData.otpCode, 
          NewPassword: formData.newPassword,
          ConfirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        setError(data.errorMessage || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (err: any) {
      setError('Lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword({ usernameorEmail: formData.usernameorEmail });
      
      if (res.message || res.isSuccess !== false) {
        setSuccess('Mã OTP mới đã được gửi!');
        setTimeLeft(600);
        setCanResend(false);
        setFormData(prev => ({ ...prev, otpCode: '' }));
        setError('');
      } else {
        setError('Không thể gửi lại OTP. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setError('Lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setSuccess('');
      setValidationErrors({});
    }
  };

  // Step progress indicator
  const renderStepIndicator = () => (
    <Box sx={{ mb: 3, textAlign: 'center' }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
        {[1, 2, 3].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: step >= stepNum ? theme.palette.warning.main : alpha(theme.palette.grey[400], 0.3),
                color: step >= stepNum ? 'white' : theme.palette.grey[600],
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              {stepNum}
            </Box>
            {stepNum < 3 && (
              <Box
                sx={{
                  width: 30,
                  height: 2,
                  bgcolor: step > stepNum ? theme.palette.warning.main : alpha(theme.palette.grey[400], 0.3),
                  transition: 'all 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>
      <Stack direction="row" spacing={4} sx={{ justifyContent: 'center' }}>
        <Typography variant="caption" color={step >= 1 ? 'warning.main' : 'text.secondary'}>
          Gửi OTP
        </Typography>
        <Typography variant="caption" color={step >= 2 ? 'warning.main' : 'text.secondary'}>
          Xác thực
        </Typography>
        <Typography variant="caption" color={step >= 3 ? 'warning.main' : 'text.secondary'}>
          Đặt lại
        </Typography>
      </Stack>
    </Box>
  );

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Quên mật khẩu?';
      case 2: return 'Xác thực OTP';
      case 3: return 'Đặt lại mật khẩu';
      default: return 'Quên mật khẩu?';
    }
  };

  const getStepDescription = () => {
    switch(step) {
      case 1: return 'Nhập email hoặc tên đăng nhập để nhận mã OTP';
      case 2: return 'Nhập mã OTP đã được gửi đến email của bạn';
      case 3: return 'Tạo mật khẩu mới cho tài khoản của bạn';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch(step) {
      case 1: return <LockReset sx={{ fontSize: 48, mb: 1 }} />;
      case 2: return <Security sx={{ fontSize: 48, mb: 1 }} />;
      case 3: return <VpnKey sx={{ fontSize: 48, mb: 1 }} />;
      default: return <LockReset sx={{ fontSize: 48, mb: 1 }} />;
    }
  };

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
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                color: 'white',
                p: 3,
                position: 'relative'
              }}
            >
              <IconButton
                onClick={step === 1 ? handleBackToLogin : handleGoBack}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  color: 'white',
                  background: alpha(theme.palette.common.white, 0.1),
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.2),
                    transform: 'translateX(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowBack />
              </IconButton>

              <Box sx={{ textAlign: 'center', pt: 2 }}>
                {getStepIcon()}
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {getStepTitle()}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {getStepDescription()}
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Step Progress */}
              {renderStepIndicator()}

              {/* Alerts */}
              {error && (
                <Alert 
                  severity="error" 
                  icon={<ErrorOutline />}
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    background: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
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
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* Step 1: Send OTP */}
              {step === 1 && (
                <Box component="form" onSubmit={handleSendOTP}>
                  <TextField
                    fullWidth
                    required
                    label="Tên đăng nhập hoặc Email"
                    placeholder="Nhập email hoặc tên đăng nhập của bạn"
                    value={formData.usernameorEmail}
                    onChange={handleChange('usernameorEmail')}
                    disabled={loading}
                    error={!!validationErrors.usernameorEmail}
                    helperText={validationErrors.usernameorEmail}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.warning.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.warning.main
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.warning.main
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: theme.palette.warning.main }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !!validationErrors.usernameorEmail}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.4)}`
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.warning.main, 0.6)
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </Button>
                </Box>
              )}

              {/* Step 2: Verify OTP */}
              {step === 2 && (
                <Box>
                  {/* Timer */}
                  {timeLeft > 0 && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Timer sx={{ color: theme.palette.warning.main }} />
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                          {formatTime(timeLeft)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã OTP sẽ hết hạn sau thời gian trên
                      </Typography>
                    </Box>
                  )}

                  <Box component="form" onSubmit={handleVerifyOTP}>
                    <TextField
                      fullWidth
                      required
                      label="Mã OTP"
                      placeholder="Nhập mã OTP gồm 6 chữ số"
                      value={formData.otpCode}
                      onChange={handleChange('otpCode')}
                      disabled={loading}
                      error={!!validationErrors.otpCode}
                      helperText={validationErrors.otpCode}
                      inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1.5rem',
                          textAlign: 'center',
                          letterSpacing: '0.5em',
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.warning.main
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.warning.main
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security sx={{ color: theme.palette.warning.main }} />
                          </InputAdornment>
                        )
                      }}
                    />

                    <Stack spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !!validationErrors.otpCode}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircleOutline />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.4)}`
                          },
                          '&:disabled': {
                            background: alpha(theme.palette.warning.main, 0.6)
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                      </Button>

                      {canResend && (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleResendOTP}
                          startIcon={<Refresh />}
                          disabled={loading}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            borderColor: alpha(theme.palette.warning.main, 0.5),
                            color: theme.palette.warning.main,
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: theme.palette.warning.main,
                              background: alpha(theme.palette.warning.main, 0.05),
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Gửi lại mã OTP
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* Step 3: Reset Password */}
              {step === 3 && (
                <Box component="form" onSubmit={handleResetPassword}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleChange('newPassword')}
                      required
                      disabled={loading}
                      error={!!validationErrors.newPassword}
                      helperText={validationErrors.newPassword}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.warning.main
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.warning.main
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.warning.main }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowPassword(!showPassword)} 
                              edge="end"
                              disabled={loading}
                              sx={{ color: theme.palette.warning.main }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* Password Strength Indicator */}
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                      disabled={loading}
                      error={!!validationErrors.confirmPassword}
                      helperText={validationErrors.confirmPassword}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.warning.main
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.warning.main
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.warning.main }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                              edge="end"
                              disabled={loading}
                              sx={{ color: theme.palette.warning.main }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !!validationErrors.newPassword || !!validationErrors.confirmPassword}
                      startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <VpnKey />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
                          transform: loading ? 'none' : 'translateY(-2px)',
                          boxShadow: loading ? 'none' : `0 8px 25px ${alpha(theme.palette.warning.main, 0.4)}`
                        },
                        '&:disabled': {
                          background: alpha(theme.palette.warning.main, 0.6)
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Additional Info */}
              <Box 
                sx={{ 
                  mt: 4, 
                  p: 3, 
                  background: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                {step === 1 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                    <strong>💡 Lưu ý:</strong> Nếu bạn không nhận được email trong vòng 5 phút, 
                    hãy kiểm tra thư mục spam hoặc thử lại với địa chỉ email khác.
                  </Typography>
                )}
                
                {step === 2 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                    <strong>🔐 Bảo mật:</strong> Mã OTP có hiệu lực trong 10 phút. 
                    Không chia sẻ mã này với bất kỳ ai khác.
                  </Typography>
                )}
                
                {step === 3 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    🔒 Để có mật khẩu mạnh, hãy bao gồm:
                    <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1 }}>
                      • Ít nhất 8 ký tự (không quá 50 ký tự)<br/>
                      • Chữ hoa và chữ thường<br/>
                      • Ít nhất 1 số<br/>
                      • Ký tự đặc biệt (!@#$%^&*...)<br/>
                      • Không được chứa khoảng trắng
                    </Typography>
                  </Typography>
                )}
              </Box>

              {/* Back to Login Button - Only show on step 1 */}
              {step === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBackToLogin}
                    startIcon={<ArrowBack />}
                    disabled={loading}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Quay lại đăng nhập
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPasswordOTPPage;