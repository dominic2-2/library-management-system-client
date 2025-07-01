'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ENV } from '@/config/env';
import { useAuth } from '@/providers/AuthProvider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface LoginData {
  usernameorEmail: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  token: string;
  expiration: string;
}

interface ApiResponse {
  isSuccess: boolean;
  errorMessage?: string;
  data?: AuthResponse;
}

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState<LoginData>({
    usernameorEmail: '',
    password: '',
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${ENV.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.token && data.expiration) {
        login(data.token, data.expiration); // ✅ gọi hàm từ AuthProvider
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${ENV.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.isSuccess) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setTabValue(0);
        setRegisterData({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setError(data.errorMessage || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Đăng nhập" />
              <Tab label="Đăng ký" />
            </Tabs>
          </Box>

          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ m: 2 }}>{success}</Alert>}

          <TabPanel value={tabValue} index={0}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Đăng nhập
            </Typography>

            <Box component="form" onSubmit={handleLoginSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Tên đăng nhập hoặc Email"
                value={loginData.usernameorEmail}
                onChange={(e) => setLoginData({ ...loginData, usernameorEmail: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                }
                label="Ghi nhớ đăng nhập"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
              </Button>

              <Box textAlign="center">
                <Button variant="text" onClick={() => router.push('/auth/forgot-password')}>
                  Quên mật khẩu?
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Đăng ký
            </Typography>

            <Box component="form" onSubmit={handleRegisterSubmit}>
              {[
                { label: 'Tên đăng nhập', key: 'username' },
                { label: 'Họ và tên', key: 'fullName' },
                { label: 'Email', key: 'email', type: 'email', icon: <Email /> },
                { label: 'Số điện thoại', key: 'phone' },
                { label: 'Địa chỉ', key: 'address' },
              ].map(({ label, key, type = 'text', icon }) => (
                <TextField
                  key={key}
                  margin="normal"
                  fullWidth
                  label={label}
                  type={type}
                  required={['username', 'fullName', 'email'].includes(key)}
                  value={(registerData as any)[key]}
                  onChange={(e) => setRegisterData({ ...registerData, [key]: e.target.value })}
                  InputProps={
                    icon
                      ? {
                          startAdornment: (
                            <InputAdornment position="start">{icon}</InputAdornment>
                          ),
                        }
                      : undefined
                  }
                />
              ))}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

              <TextField
                margin="normal"
                required
                fullWidth
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
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
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthPage;
