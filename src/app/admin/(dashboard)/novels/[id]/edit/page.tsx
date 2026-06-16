"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { novelService } from "@/lib/firebase/services/novelService";
import { storageService } from "@/lib/firebase/services/storage";
import { NovelStatus, NovelCategory } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { LoadingSpinner } from "@/components/admin/cms/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Loader2, ListOrdered } from "lucide-react";

export default function EditNovelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: novelId } = use(params);

  const [categories, setCategories] = useState<NovelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft" as NovelStatus,
    featured: false,
    seoTitle: "",
    seoDescription: "",
    selectedCategories: [] as string[],
  });

  useEffect(() => {
    async function load() {
      try {
        const [novel, cats] = await Promise.all([
          novelService.getNovelById(novelId),
          novelService.getAllCategories(),
        ]);
        setCategories(cats);
        if (!novel) {
          toast.error("Novel not found");
          router.push("/admin/novels");
          return;
        }
        setFormData({
          title: novel.title,
          slug: novel.slug,
          description: novel.description || "",
          status: novel.status,
          featured: novel.featured,
          seoTitle: novel.seoTitle || "",
          seoDescription: novel.seoDescription || "",
          selectedCategories: novel.categories || [],
        });
        setCoverPreview(novel.coverImage);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load novel");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [novelId, router]);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const selected = prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId];
      return { ...prev, selectedCategories: selected };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        featured: formData.featured,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        categories: formData.selectedCategories,
      };

      if (coverFile) {
        const path = `novels/${formData.slug}/cover-${Date.now()}`;
        const coverImage = await storageService.uploadFile(path, coverFile);
        updates.coverImage = coverImage;
        updates.ogImage = coverImage;
      }

      await novelService.updateNovel(novelId, updates);
      toast.success("Novel updated successfully!");
      router.push("/admin/novels");
    } catch (error) {
      toast.error("Failed to update novel.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Edit Novel"
        description="Update your story details, cover, and publishing status."
        action={
          <Link href={`/admin/novels/${novelId}/builder`}>
            <Button variant="outline" className="gap-2">
              <ListOrdered className="h-4 w-4" /> Chapters & Pages
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Changing the slug changes the public URL of this novel.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg font-oleo">SEO Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    rows={3}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as NovelStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Label>Cover Image</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 border-2 border-dashed border-border rounded-lg aspect-[2/3] flex flex-col items-center justify-center bg-muted/20 cursor-pointer overflow-hidden hover:bg-muted/40 transition-colors relative"
                >
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-muted-foreground">Upload Cover</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Label>Categories</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={formData.selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id)}
                      />
                      <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none">
                        {cat.name}
                      </label>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/novels")} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-brand-primary hover:bg-brand-accent">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
