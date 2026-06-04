'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

type StatusConfig = {
  label: string;
  className: string;
};

const statusMap: Record<string, StatusConfig> = {
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  draft: {
    label: 'Draft',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalised = status.toLowerCase();
  const config = statusMap[normalised];

  if (config) {
    return (
      <Badge
        variant="outline"
        className={cn('font-medium capitalize text-xs', config.className)}
      >
        {config.label}
      </Badge>
    );
  }

  // Default — blue
  return (
    <Badge
      variant="outline"
      className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-medium capitalize text-xs"
    >
      {status}
    </Badge>
  );
}
