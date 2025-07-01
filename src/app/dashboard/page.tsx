'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardIndex() {
  const { token } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(parseInt(storedRole, 10));
    } else {
      router.replace('/auth/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (role !== null) {
      switch (role) {
        case 1: // Admin
          router.replace('/admin/user-management');
          break;
        case 2: // Staff
          router.replace('/dashboard/staff');
          break;
        case 3: // User
          router.replace('/dashboard/homepage');
          break;
        default:
          router.replace('/auth/login');
          break;
      }
    }
  }, [role, router]);

  return null;
}
