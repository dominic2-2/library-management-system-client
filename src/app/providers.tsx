// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ConditionalLayout>
                    {children}
                </ConditionalLayout>
            </AuthProvider>
        </QueryClientProvider>
    );
}
