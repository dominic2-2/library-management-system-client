'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Box,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security,
  Check,
  Close,
  Shield
} from '@mui/icons-material';
import { useChangePassword } from './useChangePassword';

const ChangePassword: React.FC = () => {
  const theme = useTheme();
  const {
    formData,
    errors,
    loading,
    alert,
    handleChange,
    handleSubmit
  } = useChangePassword();

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const toggleVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <Security sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Đổi mật khẩu
            </Typography>
            <Typography variant="body1" color="white">
              Bảo vệ tài khoản bằng mật khẩu mạnh và an toàn
            </Typography>
          </Box>
        </Fade>

        {/* Alert */}
        {alert && (
          <Fade in timeout={300}>
            <Alert 
              severity={alert.type} 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(
                  alert.type === 'success' ? theme.palette.success.main : theme.palette.error.main, 
                  0.2
                )}`
              }}
            >
              {alert.message}
            </Alert>
          </Fade>
        )}

        {/* Main Card */}
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white'
                  }}
                >
                  <Shield />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Cập nhật bảo mật
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thay đổi mật khẩu để tăng cường bảo mật
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
                {/* Current Password */}
                <TextField
                  label="Mật khẩu hiện tại"
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => toggleVisibility('current')} 
                          edge="end"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {showPassword.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* New Password */}
                <TextField
                  label="Mật khẩu mới"
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="secondary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => toggleVisibility('new')} 
                          edge="end"
                          sx={{ color: theme.palette.secondary.main }}
                        >
                          {showPassword.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <Fade in timeout={300}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Độ mạnh mật khẩu:
                        </Typography>
                        <Chip
                          size="small"
                          label={strengthText[passwordStrength.level]}
                          sx={{
                            backgroundColor: alpha(strengthColor[passwordStrength.level], 0.1),
                            color: strengthColor[passwordStrength.level],
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength.score / 5) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: strengthColor[passwordStrength.level],
                            borderRadius: 4
                          }
                        }}
                      />
                      
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {passed ? (
                              <Check sx={{ fontSize: 16, color: theme.palette.success.main }} />
                            ) : (
                              <Close sx={{ fontSize: 16, color: theme.palette.error.main }} />
                            )}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: passed ? theme.palette.success.main : theme.palette.text.secondary 
                              }}
                            >
                              {key === 'length' && '8+ ký tự'}
                              {key === 'uppercase' && 'Chữ hoa'}
                              {key === 'lowercase' && 'Chữ thường'}
                              {key === 'number' && 'Số'}
                              {key === 'special' && 'Ký tự đặc biệt'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                )}

                {/* Confirm Password */}
                <TextField
                  label="Xác nhận mật khẩu mới"
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.confirmNewPassword}
                  helperText={errors.confirmNewPassword}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="success" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => toggleVisibility('confirm')} 
                          edge="end"
                          sx={{ color: theme.palette.success.main }}
                        >
                          {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Security />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`
                    },
                    '&:disabled': {
                      background: alpha(theme.palette.primary.main, 0.6),
                      transform: 'none',
                      boxShadow: 'none'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Security Tips */}
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 3,
              background: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="white" sx={{ lineHeight: 1.6 }}>
                🔐 <strong>Mẹo bảo mật:</strong> Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, 
                bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Không chia sẻ mật khẩu 
                với ai và thay đổi định kỳ để đảm bảo an toàn.
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
};

export default ChangePassword;