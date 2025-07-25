'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Alert,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Phone,
  Home,
  AccountCircle,
  SecuritySharp,
  LoginRounded,
  PersonAddRounded,
  LockOpenRounded
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { LoginData, RegisterData } from '@/features/auth/auth.types';
import { useAuth } from '@/providers/AuthProvider';
import { validateEmail, validatePassword, validateUsername, validatePhone, validateFullName, validateAddress } from '@/utils/validation';

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>({
    usernameorEmail: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation error states - Updated to accept null
  const [loginErrors, setLoginErrors] = useState<{usernameorEmail?: string | null; password?: string | null}>({});
  const [registerErrors, setRegisterErrors] = useState<{
    username?: string | null;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
  }>({});
  const { login } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // ✅ Password strength checker for Register
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

  const passwordStrength = getPasswordStrength(registerData.password);

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
    setMounted(true);
  }, []);
  
  if (!mounted) return null; 
  
  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    setError('');
    setSuccess('');
    setLoginErrors({});
    setRegisterErrors({});
  };

  // Validation functions
  const validateLoginForm = (): boolean => {
    const errors: {usernameorEmail?: string | null; password?: string | null} = {};
    
    // Check if it's email or username
    const isEmail = loginData.usernameorEmail.includes('@');
    
    if (isEmail) {
      const emailError = validateEmail(loginData.usernameorEmail);
      if (emailError) errors.usernameorEmail = emailError;
    } else {
      const usernameError = validateUsername(loginData.usernameorEmail);
      if (usernameError) errors.usernameorEmail = usernameError;
    }
    
    const passwordError = validatePassword(loginData.password);
    if (passwordError) errors.password = passwordError;
    
    setLoginErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const validateRegisterForm = (): boolean => {
    const errors: {
      username?: string | null;
      fullName?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      password?: string | null;
      confirmPassword?: string | null;
    } = {};
    
    const usernameError = validateUsername(registerData.username);
    if (usernameError) errors.username = usernameError;
    
    const fullNameError = validateFullName(registerData.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validateEmail(registerData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(registerData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const addressError = validateAddress(registerData.address);
    if (addressError) errors.address = addressError;
    
    const passwordError = validatePassword(registerData.password);
    if (passwordError) errors.password = passwordError;
    
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setRegisterErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!validateLoginForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.login(loginData);
      
      login(response.token, response.sessionInfo);

      console.log('🎯 Login successful:', {
        role: response.role,
        sessionId: response.sessionInfo?.sessionId,
        browser: response.sessionInfo?.browserInfo?.browserName,
        os: response.sessionInfo?.browserInfo?.operatingSystem
      });

      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Enhanced register with validation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side validation
    if (!validateRegisterForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // ✅ AuthService now automatically collects browser info
      const response = await AuthService.register(registerData);
      
      if (response.isSuccess) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập');
        setTab(0);
        
        // Reset register form
        setRegisterData({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirmPassword: ''
        });
        setRegisterErrors({});
        
        // ✅ Log successful registration
        console.log('✅ Registration completed successfully');
      } else {
        setError(response.errorMessage || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      setError(err.message || 'Lỗi khi đăng ký');
    } finally {
      setLoading(false);
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
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={800}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  Library System
                </Typography>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ mb: 3, fontWeight: 300 }}
                >
                  Chào mừng bạn đến với hệ thống quản lý thư viện hiện đại
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Trải nghiệm quản lý thư viện tối ưu với giao diện thân thiện và bảo mật cao. 
                  Đăng nhập để khám phá các tính năng mạnh mẽ của chúng tôi.
                </Typography>
                
                {/* ✅ NEW: Browser Info Display (Optional) */}
                <Box 
                  sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🔒 <strong>Bảo mật nâng cao:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hệ thống tự động thu thập thông tin thiết bị để tăng cường bảo mật và phân tích trải nghiệm người dùng.
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Auth Form */}
          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={600}>
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
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white'
                  }}
                >
                  <Tabs 
                    value={tab} 
                    onChange={handleTabChange} 
                    centered
                    sx={{
                      '& .MuiTab-root': {
                        color: alpha(theme.palette.common.white, 0.7),
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        minHeight: 60,
                        '&.Mui-selected': {
                          color: 'white'
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'white',
                        height: 3
                      }
                    }}
                  >
                    <Tab 
                      icon={<LoginRounded sx={{ mb: 0.5 }} />} 
                      label="Đăng nhập" 
                      iconPosition="top"
                    />
                    <Tab 
                      icon={<PersonAddRounded sx={{ mb: 0.5 }} />} 
                      label="Đăng ký" 
                      iconPosition="top"
                    />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
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
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      {success}
                    </Alert>
                  )}

                  {tab === 0 && (
                    <Fade in timeout={400}>
                      <Box component="form" onSubmit={handleLogin}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <SecuritySharp 
                            sx={{ 
                              fontSize: 48, 
                              color: theme.palette.primary.main,
                              mb: 1
                            }} 
                          />
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Đăng nhập
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Nhập thông tin để truy cập tài khoản
                          </Typography>
                        </Box>

                        <TextField
                          fullWidth
                          label="Tên đăng nhập hoặc Email"
                          value={loginData.usernameorEmail}
                          onChange={e => {
                            setLoginData({ ...loginData, usernameorEmail: e.target.value });
                            // Clear error when user starts typing
                            if (loginErrors.usernameorEmail) {
                              setLoginErrors({ ...loginErrors, usernameorEmail: null });
                            }
                          }}
                          margin="normal"
                          required
                          disabled={loading}
                          error={!!loginErrors.usernameorEmail}
                          helperText={loginErrors.usernameorEmail}
                          sx={{
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
                                <Person color="primary" />
                              </InputAdornment>
                            )
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Mật khẩu"
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={e => {
                            setLoginData({ ...loginData, password: e.target.value });
                            // Clear error when user starts typing
                            if (loginErrors.password) {
                              setLoginErrors({ ...loginErrors, password: null });
                            }
                          }}
                          margin="normal"
                          required
                          disabled={loading}
                          error={!!loginErrors.password}
                          helperText={loginErrors.password}
                          sx={{
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
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={loginData.rememberMe} 
                                onChange={e => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                                color="primary"
                                disabled={loading}
                              />
                            }
                            label="Ghi nhớ đăng nhập"
                            disabled={loading}
                          />
                          <Button
                            variant="text"
                            onClick={() => router.push('/auth/forgot-password')}
                            disabled={loading}
                            sx={{ 
                              textTransform: 'none',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                            endIcon={<LockOpenRounded />}
                          >
                            Quên mật khẩu?
                          </Button>
                        </Box>

                        <Button 
                          type="submit" 
                          variant="contained" 
                          fullWidth 
                          disabled={loading} 
                          sx={{ 
                            mt: 3,
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
                          {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                              <span>Đang đăng nhập...</span>
                            </Box>
                          ) : (
                            'Đăng nhập'
                          )}
                        </Button>
                      </Box>
                    </Fade>
                  )}

                  {tab === 1 && (
                    <Fade in timeout={400}>
                      <Box component="form" onSubmit={handleRegister}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <AccountCircle 
                            sx={{ 
                              fontSize: 48, 
                              color: theme.palette.secondary.main,
                              mb: 1
                            }} 
                          />
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Đăng ký tài khoản
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tạo tài khoản mới để bắt đầu
                          </Typography>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Tên đăng nhập"
                              value={registerData.username}
                              onChange={e => {
                                setRegisterData({ ...registerData, username: e.target.value });
                                if (registerErrors.username) {
                                  setRegisterErrors({ ...registerErrors, username: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.username}
                              helperText={registerErrors.username}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Person color="secondary" />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Họ và tên"
                              value={registerData.fullName}
                              onChange={e => {
                                setRegisterData({ ...registerData, fullName: e.target.value });
                                if (registerErrors.fullName) {
                                  setRegisterErrors({ ...registerErrors, fullName: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.fullName}
                              helperText={registerErrors.fullName}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountCircle color="secondary" />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Email"
                              type="email"
                              value={registerData.email}
                              onChange={e => {
                                setRegisterData({ ...registerData, email: e.target.value });
                                if (registerErrors.email) {
                                  setRegisterErrors({ ...registerErrors, email: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.email}
                              helperText={registerErrors.email}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Email color="secondary" />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Số điện thoại"
                              value={registerData.phone}
                              onChange={e => {
                                // ✅ NORMALIZE PHONE INPUT NGAY KHI NHẬP
                                const normalizedPhone = e.target.value.replace(/\s|-/g, '');
                                setRegisterData({ ...registerData, phone: normalizedPhone });
                                if (registerErrors.phone) {
                                  setRegisterErrors({ ...registerErrors, phone: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.phone}
                              helperText={registerErrors.phone}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Phone color="secondary" />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Địa chỉ"
                              value={registerData.address}
                              onChange={e => {
                                setRegisterData({ ...registerData, address: e.target.value });
                                if (registerErrors.address) {
                                  setRegisterErrors({ ...registerErrors, address: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.address}
                              helperText={registerErrors.address}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Home color="secondary" />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Mật khẩu"
                              type={showPassword ? 'text' : 'password'}
                              value={registerData.password}
                              onChange={e => {
                                setRegisterData({ ...registerData, password: e.target.value });
                                if (registerErrors.password) {
                                  setRegisterErrors({ ...registerErrors, password: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.password}
                              helperText={registerErrors.password}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
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
                                      onClick={() => setShowPassword(!showPassword)}
                                      edge="end"
                                      disabled={loading}
                                      sx={{ color: theme.palette.secondary.main }}
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                            
                            {/* ✅ Password Strength Indicator cho Register */}
                            {registerData.password && (
                              <Box sx={{ mt: 1, mb: 1 }}>
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

                                {/* Compact Checklist cho Register */}
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
                              fullWidth
                              label="Xác nhận mật khẩu"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={registerData.confirmPassword}
                              onChange={e => {
                                setRegisterData({ ...registerData, confirmPassword: e.target.value });
                                if (registerErrors.confirmPassword) {
                                  setRegisterErrors({ ...registerErrors, confirmPassword: null });
                                }
                              }}
                              required
                              disabled={loading}
                              error={!!registerErrors.confirmPassword}
                              helperText={registerErrors.confirmPassword}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
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
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      edge="end"
                                      disabled={loading}
                                      sx={{ color: theme.palette.secondary.main }}
                                    >
                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Button 
                          type="submit" 
                          variant="contained" 
                          fullWidth 
                          disabled={loading} 
                          sx={{ 
                            mt: 3,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                            '&:hover': {
                              background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                              transform: loading ? 'none' : 'translateY(-2px)',
                              boxShadow: loading ? 'none' : `0 8px 25px ${alpha(theme.palette.secondary.main, 0.4)}`
                            },
                            '&:disabled': {
                              background: alpha(theme.palette.secondary.main, 0.6)
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                              <span>Đang đăng ký...</span>
                            </Box>
                          ) : (
                            'Đăng ký'
                          )}
                        </Button>
                      </Box>
                    </Fade>
                  )}
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthPage;