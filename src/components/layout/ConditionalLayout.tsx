'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/providers/AuthProvider';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Danh sách các route không cần Header và Footer
  const authRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  // Kiểm tra xem route hiện tại có phải là auth route không
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Kiểm tra nếu user là Admin (role: 'Admin' hoặc '1')
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === '1';

  if (isAuthRoute || isAdmin) {
    // Chỉ render children, không có Header/Footer nếu là auth route hoặc Admin
    return <>{children}</>;
  }

  // Render layout đầy đủ với Header và Footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default ConditionalLayout;