'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link2, Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/admin/cms/PageHeader';
import { EmptyState } from '@/components/admin/cms/EmptyState';
import { LoadingSpinner } from '@/components/admin/cms/LoadingSpinner';
import { ConfirmDialog } from '@/components/admin/cms/ConfirmDialog';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { socialService } from '@/lib/firebase/services/socialService';
import type { SocialLink } from '@/types';

// ─── Form state ───────────────────────────────────────────────────────────────

interface LinkFormState {
  platform: string;
  url: string;
  displayOrder: number;
  enabled: boolean;
}

const DEFAULT_FORM: LinkFormState = {
  platform: '',
  url: '',
  displayOrder: 0,
  enabled: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateUrl(url: string, max = 45): string {
  if (url.length <= max) return url;
  return url.slice(0, max) + '…';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SocialLink | null>(null);
  const [form, setForm] = useState<LinkFormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await socialService.getAllSocialLinks();
      const sorted = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
      setLinks(sorted);
    } catch {
      toast.error('Failed to load social links.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        setInitialized(true);
        try {
          await socialService.initializeDefaults();
        } catch {
          // non-critical
        }
      }
      await fetchLinks();
    };
    init();
  }, [fetchLinks, initialized]);

  // ─── Dialog helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    const nextOrder = links.length > 0
      ? Math.max(...links.map((l) => l.displayOrder)) + 1
      : 0;
    setForm({ ...DEFAULT_FORM, displayOrder: nextOrder });
    setDialogOpen(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditTarget(link);
    setForm({
      platform: link.platform,
      url: link.url,
      displayOrder: link.displayOrder,
      enabled: link.enabled,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
    setForm(DEFAULT_FORM);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.platform.trim()) {
      toast.error('Platform name is required.');
      return;
    }
    if (!form.url.trim()) {
      toast.error('URL is required.');
      return;
    }
    try {
      setSaving(true);
      if (editTarget) {
        await socialService.updateSocialLink(editTarget.id, {
          platform: form.platform.trim(),
          url: form.url.trim(),
          displayOrder: form.displayOrder,
          enabled: form.enabled,
        });
        toast.success('Social link updated.');
      } else {
        await socialService.saveSocialLink({
          platform: form.platform.trim(),
          url: form.url.trim(),
          displayOrder: form.displayOrder,
          enabled: form.enabled,
        });
        toast.success('Social link added.');
      }
      closeDialog();
      await fetchLinks();
    } catch {
      toast.error('Failed to save social link.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle ──────────────────────────────────────────────────────────────────

  const handleToggle = async (link: SocialLink) => {
    setToggling((prev) => ({ ...prev, [link.id]: true }));
    try {
      await socialService.updateSocialLink(link.id, { enabled: !link.enabled });
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, enabled: !l.enabled } : l))
      );
      toast.success(`${link.platform} ${link.enabled ? 'disabled' : 'enabled'}.`);
    } catch {
      toast.error('Failed to toggle link.');
    } finally {
      setToggling((prev) => ({ ...prev, [link.id]: false }));
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await socialService.deleteSocialLink(deleteTarget.id);
      toast.success('Social link deleted.');
      setDeleteTarget(null);
      await fetchLinks();
    } catch {
      toast.error('Failed to delete link.');
    } finally {
      setDeleting(false);
    }
  };

  const setField = <K extends keyof LinkFormState>(key: K, value: LinkFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="Social Links"
        description="Manage the social media links displayed on your site."
        action={
          <Button
            onClick={openAdd}
            className="bg-brand-primary hover:bg-brand-accent text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : links.length === 0 ? (
        <EmptyState
          title="No social links yet"
          description="Add your first social media link to get started."
          actionLabel="Add Link"
          onAction={openAdd}
          icon={<Link2 className="h-8 w-8" />}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Platform</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">URL</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-20">Order</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-28">Enabled</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-brand-soft text-brand-primary font-klee"
                    >
                      {link.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-accent hover:underline font-mono"
                      title={link.url}
                    >
                      {truncateUrl(link.url)}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {link.displayOrder}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={link.enabled}
                      disabled={toggling[link.id]}
                      onCheckedChange={() => handleToggle(link)}
                      aria-label={`Toggle ${link.platform}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(link)}
                        className="h-8 w-8 text-muted-foreground hover:text-brand-primary"
                        aria-label="Edit link"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(link)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete link"
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
              {editTarget ? 'Edit Social Link' : 'Add Social Link'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="sl-platform">Platform</Label>
              <Input
                id="sl-platform"
                placeholder="e.g. Instagram, Twitter, YouTube"
                value={form.platform}
                onChange={(e) => setField('platform', e.target.value)}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="sl-url">URL</Label>
              <Input
                id="sl-url"
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setField('url', e.target.value)}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="sl-order">Display Order</Label>
              <Input
                id="sl-order"
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) =>
                  setField('displayOrder', parseInt(e.target.value, 10) || 0)
                }
              />
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="sl-enabled" className="text-sm font-medium">
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show this link on your site.
                </p>
              </div>
              <Switch
                id="sl-enabled"
                checked={form.enabled}
                onCheckedChange={(checked) => setField('enabled', checked)}
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
              {saving ? <LoadingSpinner size="sm" /> : editTarget ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Social Link"
        description={`Are you sure you want to delete the ${deleteTarget?.platform} link? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
