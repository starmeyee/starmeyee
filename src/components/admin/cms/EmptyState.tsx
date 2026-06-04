'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-8 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm text-brand-soft">
          {icon}
        </div>
      )}
      <h3 className="font-oleo text-xl text-brand-primary mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
