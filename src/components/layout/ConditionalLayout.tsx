'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Danh sách các route không cần Header và Footer
  const authRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
  ];
  
  // Kiểm tra xem route hiện tại có phải là auth route không
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  if (isAuthRoute) {
    // Chỉ render children, không có Header/Footer
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