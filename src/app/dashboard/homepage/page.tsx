'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardIndex() {
  const { user, isAuthenticated } = useAuth(); // 👈 bây giờ không lỗi nữa
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    switch (user.role) {
      case 'Admin':
        router.push('/dashboard/admin');
        break;
      case 'Staff':
        router.push('/dashboard/staff');
        break;
      case 'User':
        router.push('/dashboard/user');
        break;
      default:
        router.push('/auth/login');
    }
  }, [user, isAuthenticated, router]);

  return null;
}
