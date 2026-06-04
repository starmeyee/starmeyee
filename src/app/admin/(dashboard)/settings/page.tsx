'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Globe, Palette, FileText } from 'lucide-react';

import { PageHeader } from '@/components/admin/cms/PageHeader';
import { LoadingSpinner } from '@/components/admin/cms/LoadingSpinner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { settingsService } from '@/lib/firebase/services/settingsService';
import type { SiteSettings } from '@/types';

// ─── Default state ────────────────────────────────────────────────────────────

interface GeneralForm {
  siteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

interface BrandForm {
  brandColors: {
    primary: string;
    accent: string;
    secondary: string;
    soft: string;
  };
  fonts: {
    body: string;
    display: string;
    accent: string;
  };
}

interface FooterForm {
  footerContent: string;
  credits: string;
}

const DEFAULT_GENERAL: GeneralForm = {
  siteName: '',
  seoDefaultTitle: '',
  seoDefaultDescription: '',
};

const DEFAULT_BRAND: BrandForm = {
  brandColors: {
    primary: '#211C84',
    accent: '#4D55CC',
    secondary: '#7A73D1',
    soft: '#B5A8D5',
  },
  fonts: {
    body: '',
    display: '',
    accent: '',
  },
};

const DEFAULT_FOOTER: FooterForm = {
  footerContent: '',
  credits: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);

  // Tab-specific form states
  const [general, setGeneral] = useState<GeneralForm>(DEFAULT_GENERAL);
  const [brand, setBrand] = useState<BrandForm>(DEFAULT_BRAND);
  const [footer, setFooter] = useState<FooterForm>(DEFAULT_FOOTER);

  // Per-tab saving
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data: SiteSettings | null = await settingsService.getSettings();
      if (data) {
        setGeneral({
          siteName: data.siteName ?? '',
          seoDefaultTitle: data.seoDefaultTitle ?? '',
          seoDefaultDescription: data.seoDefaultDescription ?? '',
        });
        setBrand({
          brandColors: {
            primary: data.brandColors?.primary ?? DEFAULT_BRAND.brandColors.primary,
            accent: data.brandColors?.accent ?? DEFAULT_BRAND.brandColors.accent,
            secondary: data.brandColors?.secondary ?? DEFAULT_BRAND.brandColors.secondary,
            soft: data.brandColors?.soft ?? DEFAULT_BRAND.brandColors.soft,
          },
          fonts: {
            body: data.fonts?.body ?? '',
            display: data.fonts?.display ?? '',
            accent: data.fonts?.accent ?? '',
          },
        });
        setFooter({
          footerContent: data.footerContent ?? '',
          credits: data.credits ?? '',
        });
      }
    } catch {
      toast.error('Failed to load site settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Helpers to build full payload from current form state ───────────────────

  const buildFullPayload = (): Omit<SiteSettings, 'id' | 'updatedAt'> => ({
    siteName: general.siteName,
    seoDefaultTitle: general.seoDefaultTitle,
    seoDefaultDescription: general.seoDefaultDescription,
    brandColors: brand.brandColors,
    fonts: brand.fonts,
    footerContent: footer.footerContent,
    credits: footer.credits,
  });

  // ─── Save handlers ────────────────────────────────────────────────────────────

  const handleSaveGeneral = async () => {
    if (!general.siteName.trim()) {
      toast.error('Site name is required.');
      return;
    }
    try {
      setSavingGeneral(true);
      await settingsService.saveSettings({
        ...buildFullPayload(),
        siteName: general.siteName.trim(),
        seoDefaultTitle: general.seoDefaultTitle.trim(),
        seoDefaultDescription: general.seoDefaultDescription.trim(),
      });
      toast.success('General settings saved.');
    } catch {
      toast.error('Failed to save general settings.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveBrand = async () => {
    try {
      setSavingBrand(true);
      await settingsService.saveSettings({
        ...buildFullPayload(),
        brandColors: brand.brandColors,
        fonts: brand.fonts,
      });
      toast.success('Brand settings saved.');
    } catch {
      toast.error('Failed to save brand settings.');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSaveFooter = async () => {
    try {
      setSavingFooter(true);
      await settingsService.saveSettings({
        ...buildFullPayload(),
        footerContent: footer.footerContent.trim(),
        credits: footer.credits.trim(),
      });
      toast.success('Footer settings saved.');
    } catch {
      toast.error('Failed to save footer settings.');
    } finally {
      setSavingFooter(false);
    }
  };

  // ─── Field setters ────────────────────────────────────────────────────────────

  const setGeneralField = <K extends keyof GeneralForm>(key: K, value: GeneralForm[K]) =>
    setGeneral((prev) => ({ ...prev, [key]: value }));

  const setBrandColor = (key: keyof BrandForm['brandColors'], value: string) =>
    setBrand((prev) => ({
      ...prev,
      brandColors: { ...prev.brandColors, [key]: value },
    }));

  const setFont = (key: keyof BrandForm['fonts'], value: string) =>
    setBrand((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));

  const setFooterField = <K extends keyof FooterForm>(key: K, value: FooterForm[K]) =>
    setFooter((prev) => ({ ...prev, [key]: value }));

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <PageHeader
        title="Site Settings"
        description="Manage your site's global configuration, brand identity, and footer content."
      />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 border border-border">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white">
              <Palette className="h-4 w-4" />
              Brand
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: General ─────────────────────────────────────────────── */}
          <TabsContent value="general">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle className="font-oleo text-lg text-brand-primary flex items-center gap-2">
                  <Globe className="h-5 w-5" /> General
                </CardTitle>
                <CardDescription>Basic site identity and SEO defaults.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    placeholder="e.g. StarMeyee"
                    value={general.siteName}
                    onChange={(e) => setGeneralField('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Default Title</Label>
                  <Input
                    id="seoTitle"
                    placeholder="e.g. StarMeyee — Cosmic Stories & Art"
                    value={general.seoDefaultTitle}
                    onChange={(e) => setGeneralField('seoDefaultTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDesc">SEO Default Description</Label>
                  <Textarea
                    id="seoDesc"
                    placeholder="A short description of your site for search engines..."
                    rows={3}
                    className="resize-none"
                    value={general.seoDefaultDescription}
                    onChange={(e) =>
                      setGeneralField('seoDefaultDescription', e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveGeneral}
                    disabled={savingGeneral}
                    className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]"
                  >
                    {savingGeneral ? <LoadingSpinner size="sm" /> : 'Save General'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Brand ───────────────────────────────────────────────── */}
          <TabsContent value="brand">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle className="font-oleo text-lg text-brand-primary flex items-center gap-2">
                  <Palette className="h-5 w-5" /> Brand
                </CardTitle>
                <CardDescription>
                  Configure your brand color palette and typography.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Colors */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Brand Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        { key: 'primary', label: 'Primary' },
                        { key: 'accent', label: 'Accent' },
                        { key: 'secondary', label: 'Secondary' },
                        { key: 'soft', label: 'Soft' },
                      ] as const
                    ).map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`color-${key}`}>{label}</Label>
                        <div className="flex items-center gap-3">
                          <input
                            id={`color-${key}`}
                            type="color"
                            value={brand.brandColors[key]}
                            onChange={(e) => setBrandColor(key, e.target.value)}
                            className="h-10 w-10 cursor-pointer rounded-md border border-border p-0.5 bg-transparent"
                            aria-label={`${label} color`}
                          />
                          <Input
                            value={brand.brandColors[key]}
                            onChange={(e) => setBrandColor(key, e.target.value)}
                            placeholder="#000000"
                            className="font-mono text-sm flex-1"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Fonts</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="font-body">Body Font</Label>
                      <Input
                        id="font-body"
                        placeholder="e.g. Klee One"
                        value={brand.fonts.body}
                        onChange={(e) => setFont('body', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-display">Display Font</Label>
                      <Input
                        id="font-display"
                        placeholder="e.g. Oleo Script"
                        value={brand.fonts.display}
                        onChange={(e) => setFont('display', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-accent">Accent Font</Label>
                      <Input
                        id="font-accent"
                        placeholder="e.g. Schoolbell"
                        value={brand.fonts.accent}
                        onChange={(e) => setFont('accent', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveBrand}
                    disabled={savingBrand}
                    className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]"
                  >
                    {savingBrand ? <LoadingSpinner size="sm" /> : 'Save Brand'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Footer ──────────────────────────────────────────────── */}
          <TabsContent value="footer">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle className="font-oleo text-lg text-brand-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Footer
                </CardTitle>
                <CardDescription>
                  Customise the footer text and credits shown at the bottom of your site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="footerContent">Footer Content</Label>
                  <Textarea
                    id="footerContent"
                    placeholder="Enter footer text, copyright notice, or any other content..."
                    rows={4}
                    className="resize-none"
                    value={footer.footerContent}
                    onChange={(e) => setFooterField('footerContent', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    placeholder="e.g. Designed and Developed by Utkarsh"
                    value={footer.credits}
                    onChange={(e) => setFooterField('credits', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Attribution text for the site designer/developer.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveFooter}
                    disabled={savingFooter}
                    className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]"
                  >
                    {savingFooter ? <LoadingSpinner size="sm" /> : 'Save Footer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
