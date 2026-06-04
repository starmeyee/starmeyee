'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

export function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-brand-primary border-t-transparent',
        sizeClasses[size]
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
}
