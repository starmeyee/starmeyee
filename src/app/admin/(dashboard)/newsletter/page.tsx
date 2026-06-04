'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

import { PageHeader } from '@/components/admin/cms/PageHeader';
import { LoadingSpinner } from '@/components/admin/cms/LoadingSpinner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { newsletterService } from '@/lib/firebase/services/newsletterService';
import type { NewsletterSettings } from '@/types';

// ─── Default form ─────────────────────────────────────────────────────────────

interface FormState {
  headline: string;
  description: string;
  ctaText: string;
  provider: string;
  enabled: boolean;
}

const DEFAULT_FORM: FormState = {
  headline: '',
  description: '',
  ctaText: '',
  provider: '',
  enabled: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsletterSettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data: NewsletterSettings | null = await newsletterService.getSettings();
      if (data) {
        setForm({
          headline: data.headline,
          description: data.description,
          ctaText: data.ctaText,
          provider: data.provider,
          enabled: data.enabled,
        });
      }
    } catch {
      toast.error('Failed to load newsletter settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.headline.trim()) {
      toast.error('Headline is required.');
      return;
    }
    try {
      setSaving(true);
      await newsletterService.saveSettings({
        headline: form.headline.trim(),
        description: form.description.trim(),
        ctaText: form.ctaText.trim(),
        provider: form.provider.trim(),
        enabled: form.enabled,
      });
      toast.success('Newsletter settings saved.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <PageHeader
        title="Newsletter Settings"
        description="Configure the newsletter section that appears on your site."
      />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
                <Mail className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <CardTitle className="font-oleo text-lg text-brand-primary">
                  Newsletter Configuration
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  These settings power your newsletter sign-up block.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. Join the Cosmic Circle"
                value={form.headline}
                onChange={(e) => setField('headline', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A short description of your newsletter..."
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="resize-none"
              />
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Text</Label>
              <Input
                id="ctaText"
                placeholder="e.g. Subscribe Now"
                value={form.ctaText}
                onChange={(e) => setField('ctaText', e.target.value)}
              />
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                placeholder="e.g. beehiiv, mailchimp"
                value={form.provider}
                onChange={(e) => setField('provider', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The email service provider you use to manage subscribers.
              </p>
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="nl-enabled" className="text-sm font-medium">
                  Newsletter Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show the newsletter sign-up section on your site.
                </p>
              </div>
              <Switch
                id="nl-enabled"
                checked={form.enabled}
                onCheckedChange={(checked) => setField('enabled', checked)}
              />
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]"
              >
                {saving ? <LoadingSpinner size="sm" /> : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
