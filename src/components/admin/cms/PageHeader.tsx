'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div className="space-y-1">
        <h1 className="font-oleo text-2xl text-brand-primary leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xl">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
