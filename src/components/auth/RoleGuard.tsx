"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      if (!allowedRoles.includes(profile.role as Role)) {
        router.push('/admin');
      }
    }
  }, [profile, loading, allowedRoles, router]);

  if (loading || !profile) {
    return null;
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    return null; // or an Unauthorized component
  }

  return <>{children}</>;
}
