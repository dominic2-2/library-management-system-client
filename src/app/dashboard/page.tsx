'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  role: string;
}

export default function DashboardIndex() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // đợi token load xong

    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      console.log('Decoded role:', decoded.role); // debug xem đúng ko

      if (decoded.role === 'Admin') {
        router.push('/dashboard/admin');
      } else if (decoded.role === 'Staff') {
        router.push('/dashboard/staff');
      } else if (decoded.role === 'User') {
        router.push('/dashboard/homepage');
      } else {
        router.push('/auth/login'); // fallback nếu role sai
      }
    } catch (error) {
      console.error('Invalid token', error);
      router.push('/auth/login');
    }
  }, [token, isLoading, router]);

  return null;
}
