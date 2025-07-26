"use client";

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
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/dashboard",
  ];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Kiểm tra nếu user là Admin (role: 'Admin' hoặc '1')
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === '1';

  if (isAuthRoute || isAdmin) {
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
