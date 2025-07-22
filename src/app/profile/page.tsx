'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import UpdateProfile from '@/features/user/UpdateProfile';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function ProfilePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Chặn user chưa đăng nhập
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated]);

  // Đang xác thực hoặc chưa đăng nhập → tạm ẩn trang
  if (loading || !isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Đang xác thực tài khoản...
        </Typography>
      </Box>
    );
  }

  return <UpdateProfile />;
}
