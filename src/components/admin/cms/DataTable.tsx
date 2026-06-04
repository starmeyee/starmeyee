'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from './EmptyState';
import { Search } from 'lucide-react';

interface DataTableProps {
  columns: string[];
  children?: React.ReactNode;
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <div className="h-4 rounded bg-gray-200 w-full max-w-[160px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable({
  columns,
  children,
  loading = false,
  searchPlaceholder = 'Search…',
  onSearch,
}: DataTableProps) {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {onSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="font-semibold text-foreground whitespace-nowrap"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows columns={columns.length} />
            ) : hasChildren ? (
              children
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="py-6 px-4">
                    <EmptyState
                      title="No records found"
                      description="There are no items to display yet. Add your first entry to get started."
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
