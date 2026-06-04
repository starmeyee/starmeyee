"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import PerformanceLogger from '@/components/public/PerformanceLogger';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PerformanceLogger />
      {children}
    </AuthProvider>
  );
}

