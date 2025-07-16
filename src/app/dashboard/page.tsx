'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function DashboardIndex() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Đợi AuthProvider load xong
    if (authLoading) return;

    setRedirecting(true);

    if (!user) {
      // Không có user -> redirect về login
      router.replace('/auth/login');
      return;
    }

    // Redirect theo role
    const roleRoutes: Record<string, string> = {
      'Admin': '/admin/user-management',
      'Staff': '/dashboard/staff', 
      'User': '/profile'
    };

    const targetRoute = roleRoutes[user.role] || '/profile';
    
    console.log(`🚀 Redirecting ${user.role} to: ${targetRoute}`);
    router.replace(targetRoute);

  }, [user, authLoading, router]);

  // Hiển thị loading spinner trong khi redirect
  if (authLoading || redirecting) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          {authLoading ? 'Đang xác thực...' : 'Đang chuyển hướng...'}
        </Typography>
      </Box>
    );
  }

  return null;
}