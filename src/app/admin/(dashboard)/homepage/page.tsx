'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/admin/cms/PageHeader';
import { EmptyState } from '@/components/admin/cms/EmptyState';
import { LoadingSpinner } from '@/components/admin/cms/LoadingSpinner';
import { ConfirmDialog } from '@/components/admin/cms/ConfirmDialog';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { homepageService } from '@/lib/firebase/services/homepageService';
import type { HomepageSection, HomepageSectionType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_TYPES: { value: HomepageSectionType; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'featured_novel', label: 'Featured Novel' },
  { value: 'about_preview', label: 'About Preview' },
  { value: 'music_preview', label: 'Music Preview' },
  { value: 'gallery_preview', label: 'Gallery Preview' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'custom', label: 'Custom' },
];

// ─── Default form state ────────────────────────────────────────────────────────

interface SectionFormState {
  type: HomepageSectionType;
  title: string;
  enabled: boolean;
}

const DEFAULT_FORM: SectionFormState = {
  type: 'hero',
  title: '',
  enabled: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HomepageSection | null>(null);
  const [form, setForm] = useState<SectionFormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<HomepageSection | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle loading map
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await homepageService.getAllSections();
      setSections(data);
    } catch {
      toast.error('Failed to load homepage sections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ─── Dialog helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (section: HomepageSection) => {
    setEditTarget(section);
    setForm({ type: section.type, title: section.title, enabled: section.enabled });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
    setForm(DEFAULT_FORM);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    try {
      setSaving(true);
      if (editTarget) {
        await homepageService.updateSection(editTarget.id, {
          type: form.type,
          title: form.title.trim(),
          enabled: form.enabled,
        });
        toast.success('Section updated.');
      } else {
        const nextOrder = sections.length > 0
          ? Math.max(...sections.map((s) => s.displayOrder)) + 1
          : 0;
        await homepageService.createSection({
          type: form.type,
          title: form.title.trim(),
          enabled: form.enabled,
          displayOrder: nextOrder,
          content: {},
        });
        toast.success('Section created.');
      }
      closeDialog();
      await fetchSections();
    } catch {
      toast.error('Failed to save section.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle enabled ──────────────────────────────────────────────────────────

  const handleToggle = async (section: HomepageSection) => {
    setToggling((prev) => ({ ...prev, [section.id]: true }));
    try {
      await homepageService.updateSection(section.id, { enabled: !section.enabled });
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s))
      );
      toast.success(`Section ${section.enabled ? 'disabled' : 'enabled'}.`);
    } catch {
      toast.error('Failed to toggle section.');
    } finally {
      setToggling((prev) => ({ ...prev, [section.id]: false }));
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await homepageService.deleteSection(deleteTarget.id);
      toast.success('Section deleted.');
      setDeleteTarget(null);
      await fetchSections();
    } catch {
      toast.error('Failed to delete section.');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Type label ──────────────────────────────────────────────────────────────

  const typeLabel = (type: HomepageSectionType) =>
    SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <PageHeader
        title="Homepage Sections"
        description="Manage the sections displayed on your homepage and control their order and visibility."
        action={
          <Button
            onClick={openAdd}
            className="bg-brand-primary hover:bg-brand-accent text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : sections.length === 0 ? (
        <EmptyState
          title="No sections yet"
          description="Add your first homepage section to get started."
          actionLabel="Add Section"
          onAction={openAdd}
          icon={<GripVertical className="h-8 w-8" />}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10" />
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Order</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Title</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {section.displayOrder}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-brand-soft text-brand-primary font-klee"
                    >
                      {typeLabel(section.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{section.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={section.enabled}
                        disabled={toggling[section.id]}
                        onCheckedChange={() => handleToggle(section)}
                        aria-label={`Toggle ${section.title}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {section.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(section)}
                        className="h-8 w-8 text-muted-foreground hover:text-brand-primary"
                        aria-label="Edit section"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(section)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-oleo text-brand-primary">
              {editTarget ? 'Edit Section' : 'Add Section'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="section-type">Section Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, type: val as HomepageSectionType }))
                }
              >
                <SelectTrigger id="section-type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                placeholder="Enter section title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="section-enabled" className="text-sm font-medium">
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show this section on the homepage.
                </p>
              </div>
              <Switch
                id="section-enabled"
                checked={form.enabled}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-accent text-white min-w-[90px]"
            >
              {saving ? <LoadingSpinner size="sm" /> : editTarget ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Section"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
