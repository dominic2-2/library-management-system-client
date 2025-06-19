'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardIndex() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role === 'Admin') {
      router.push('/dashboard/admin');
    } else if (user.role === 'Staff') {
      router.push('/dashboard/staff');
    } else if (user.role === 'User') {
      router.push('/dashboard/user');
    }
  }, [user, router]);

  return null;
}
