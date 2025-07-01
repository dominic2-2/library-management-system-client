'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock, 
  ArrowBack, 
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { ENV } from '@/config/env';

interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
}

const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check password strength
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return { score: 0, label: '', color: 'error' };
    if (password.length < 6) return { score: 25, label: 'Yếu', color: 'error' };
    if (password.length < 8) return { score: 50, label: 'Trung bình', color: 'warning' };
    if (password.length < 12) return { score: 75, label: 'Mạnh', color: 'info' };
    return { score: 100, label: 'Rất mạnh', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // Validate passwords match
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0;

  useEffect(() => {
    // Get token from URL parameters
    const token = searchParams.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
      setTokenValid(true);
    } else {
      setTokenValid(false);
      setError('Token không hợp lệ hoặc bị thiếu. Vui lòng thử lại với liên kết mới.');
    }
  }, [searchParams]);

  // Countdown timer for redirect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      router.push('/auth/login');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.token) {
      setError('Token không hợp lệ');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${ENV.apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mật khẩu đã được đặt lại thành công!');
        // Clear form
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
        setCountdown(3); // Start countdown
      } else {
        setError(data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleInputChange = (field: keyof ResetPasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  // If token is invalid, show error state
  if (tokenValid === false) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Liên kết không hợp lệ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </Typography>
              <Button
                variant="contained"
                onClick={handleForgotPassword}
                sx={{ mr: 2 }}
              >
                Gửi lại liên kết
              </Button>
              <Button
                variant="outlined"
                onClick={handleBackToLogin}
              >
                Quay lại đăng nhập
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
          {/* Header with Back Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToLogin}
              variant="text"
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
            <Typography component="h1" variant="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
              Đặt lại mật khẩu
            </Typography>
          </Box>

          {/* Alert Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {success}
                </Typography>
                <Typography variant="body2">
                  Tự động chuyển về trang đăng nhập trong {countdown} giây...
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Main Form Card */}
          <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tạo mật khẩu mới
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mật khẩu mới phải có ít nhất 6 ký tự và khác với mật khẩu cũ.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                {/* New Password */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
                  disabled={loading || !!success}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        Độ mạnh mật khẩu: <strong>{passwordStrength.label}</strong>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength.score}
                      color={passwordStrength.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                {/* Confirm Password */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  disabled={loading || !!success}
                  error={formData.confirmPassword.length > 0 && !passwordsMatch}
                  helperText={
                    formData.confirmPassword.length > 0 && !passwordsMatch
                      ? 'Mật khẩu xác nhận không khớp'
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        {passwordsMatch && (
                          <CheckCircle sx={{ color: 'success.main', ml: 1 }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={
                    loading || 
                    !!success ||
                    !formData.newPassword || 
                    !passwordsMatch ||
                    formData.newPassword.length < 6
                  }
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang đặt lại...
                    </>
                  ) : success ? (
                    'Đã đặt lại thành công'
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </Box>

              {/* Security Tips */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Mẹo bảo mật:</strong>
                  <br />
                  • Sử dụng mật khẩu dài ít nhất 8 ký tự
                  <br />
                  • Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
                  <br />
                  • Không sử dụng thông tin cá nhân dễ đoán
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Gặp vấn đề?{' '}
              <Button
                variant="text"
                onClick={handleForgotPassword}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Gửi lại liên kết đặt lại
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;