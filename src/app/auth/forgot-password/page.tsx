'use client';

import React, { useState } from 'react';
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
  Card,
  CardContent
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ENV } from '@/config/env';

interface ForgotPasswordData {
  usernameorEmail: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState<ForgotPasswordData>({
    usernameorEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!formData.usernameorEmail.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc email');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${ENV.apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameorEmail: formData.usernameorEmail.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          data.message || 
          'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
        );
        setFormData({ usernameorEmail: '' });
      } else {
        setError(data.message || 'Có lỗi xảy ra khi gửi yêu cầu');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      usernameorEmail: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

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
              Quên mật khẩu
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
              {success}
            </Alert>
          )}

          {/* Main Form Card */}
          <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Email sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Khôi phục mật khẩu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhập tên đăng nhập hoặc địa chỉ email của bạn. 
                  Chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu tài khoản tồn tại trong hệ thống.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Tên đăng nhập hoặc Email"
                  placeholder="Nhập tên đăng nhập hoặc email của bạn"
                  value={formData.usernameorEmail}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color={error ? 'error' : 'action'} />
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
                  disabled={loading || !formData.usernameorEmail.trim()}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi liên kết đặt lại mật khẩu'
                  )}
                </Button>
              </Box>

              {/* Additional Info */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  <strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu sẽ có hiệu lực trong 10 phút. 
                  Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nhớ mật khẩu?{' '}
              <Button
                variant="text"
                onClick={handleBackToLogin}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Đăng nhập ngay
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;