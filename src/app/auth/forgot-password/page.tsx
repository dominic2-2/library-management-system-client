'use client';

import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import { 
  Email, 
  LockReset, 
  ArrowBack,
  Send,
  CheckCircleOutline,
  ErrorOutline
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { ForgotPasswordData } from '@/features/auth/auth.types';
import { validateUsernameOrEmail } from '@/utils/validation';

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    usernameorEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationError, setValidationError] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ usernameorEmail: value });
    setError('');
    setSuccess('');

    if(value.trim()) {
      const validationResult = validateUsernameOrEmail(value);
      setValidationError(validationResult || '');
    }else {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validateUsernameOrEmail(formData.usernameorEmail);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(formData);
      console.log('Response:', res);

      if (res.message) {
        setSuccess(res.message);
        setFormData({ usernameorEmail: '' });
        setError('');
      } else {
        setError('Không nhận được phản hồi từ máy chủ.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
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
                onClick={handleBackToLogin}
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
                <LockReset sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Quên mật khẩu?
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Đừng lo lắng, chúng tôi sẽ giúp bạn khôi phục
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Description */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Nhập tên đăng nhập hoặc email của bạn, chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
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

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  required
                  label="Tên đăng nhập hoặc Email"
                  placeholder="Nhập email hoặc tên đăng nhập của bạn"
                  value={formData.usernameorEmail}
                  onChange={handleChange}
                  disabled={loading}
                  error={!!validationError}
                  helperText={validationError}
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

                <Stack spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !!validationError}
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
                    {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                  </Button>

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
                </Stack>
              </Box>

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
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                  <strong>💡 Lưu ý:</strong> Nếu bạn không nhận được email trong vòng 5 phút, 
                  hãy kiểm tra thư mục spam hoặc thử lại với địa chỉ email khác.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;