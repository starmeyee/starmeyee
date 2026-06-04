"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productService } from "@/lib/firebase/services/productService";
import { storageService } from "@/lib/firebase/services/storage";
import { ProductStatus, ProductCategory } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Loader2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    gumroadLink: "",
    status: "draft" as ProductStatus,
    featured: false,
    seoTitle: "",
    seoDescription: "",
    selectedCategories: [] as string[]
  });

  useEffect(() => {
    productService.getAllCategories().then(setCategories);
  }, []);

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, title, slug }));
  };

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

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }
    
    setSaving(true);
    try {
      let coverImage = null;
      if (coverFile) {
        const path = `products/${formData.slug}/cover-${Date.now()}`;
        coverImage = await storageService.uploadFile(path, coverFile);
      }

      const status = publish ? "published" : formData.status;

      await productService.createProduct({
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        gumroadLink: formData.gumroadLink,
        status,
        featured: formData.featured,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        categories: formData.selectedCategories,
        coverImage,
        ogImage: coverImage
      });

      toast.success(publish ? "Product published!" : "Draft saved!");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to save product.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="Create Product" 
        description="Add a new product to your store."
      />

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gumroad">Gumroad Link</Label>
                    <Input 
                      id="gumroad" 
                      type="url"
                      placeholder="https://..."
                      value={formData.gumroadLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, gumroadLink: e.target.value }))}
                    />
                  </div>
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
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as ProductStatus }))}
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
                  className="mt-2 border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center bg-muted/20 cursor-pointer overflow-hidden hover:bg-muted/40 transition-colors relative"
                >
                  {coverPreview ? (
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
                      <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={saving} className="bg-brand-primary hover:bg-brand-accent">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}
