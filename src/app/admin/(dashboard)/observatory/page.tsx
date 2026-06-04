"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { galleryService } from "@/lib/firebase/services/galleryService";
import { GalleryItem } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { EmptyState } from "@/components/admin/cms/EmptyState";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Image as ImageIcon, Camera, Trash2, Loader2 } from "lucide-react";

export default function ObservatoryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<{ id: string, url: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    featuredOnHomepage: false,
    featuredInObservatory: true,
    displayOrder: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const fetched = await galleryService.getAllGalleryItems();
      setItems(fetched);
    } catch (error) {
      toast.error("Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const newId = await galleryService.addGalleryItem({
        title: formData.title,
        description: formData.description,
        featuredOnHomepage: formData.featuredOnHomepage,
        featuredInObservatory: formData.featuredInObservatory,
        displayOrder: Number(formData.displayOrder),
        imageFile
      });

      toast.success("Image uploaded successfully");
      setIsDialogOpen(false);
      
      // Reset form
      setFormData({ title: "", description: "", featuredOnHomepage: false, featuredInObservatory: true, displayOrder: 0 });
      setImageFile(null);
      setImagePreview(null);
      
      fetchItems();
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await galleryService.deleteGalleryItem(deleteId.id, deleteId.url);
      setItems(items.filter(i => i.id !== deleteId.id));
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleFeature = async (id: string, field: 'featuredOnHomepage' | 'featuredInObservatory', currentVal: boolean) => {
    try {
      await galleryService.updateGalleryItem(id, { [field]: !currentVal });
      setItems(items.map(i => i.id === id ? { ...i, [field]: !currentVal } : i));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Observatory Gallery" 
        description="Manage your space photography, cosmic memories, and astronomy images."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Camera className="mr-2 h-4 w-4" /> Upload Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 py-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg h-48 flex flex-col items-center justify-center bg-muted/20 cursor-pointer overflow-hidden hover:bg-muted/40 transition-colors relative"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-muted-foreground">Click to select image</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between border p-3 rounded-md">
                    <Label className="text-sm">Home Feature</Label>
                    <Switch checked={formData.featuredOnHomepage} onCheckedChange={c => setFormData({...formData, featuredOnHomepage: c})} />
                  </div>
                  <div className="flex items-center justify-between border p-3 rounded-md">
                    <Label className="text-sm">Obs Feature</Label>
                    <Switch checked={formData.featuredInObservatory} onCheckedChange={c => setFormData({...formData, featuredInObservatory: c})} />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isUploading || !imageFile}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Upload
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {!loading && items.length === 0 ? (
        <EmptyState 
          icon={<ImageIcon className="h-8 w-8 text-brand-primary" />}
          title="Empty Observatory"
          description="Upload your first space photography or cosmic memory."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-video relative bg-black">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeleteId({ id: item.id, url: item.imageUrl })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold truncate" title={item.title}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1" title={item.description}>
                    {item.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge 
                    variant={item.featuredOnHomepage ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleFeature(item.id, 'featuredOnHomepage', item.featuredOnHomepage)}
                  >
                    Home
                  </Badge>
                  <Badge 
                    variant={item.featuredInObservatory ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFeature(item.id, 'featuredInObservatory', item.featuredInObservatory)}
                  >
                    Observatory
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog 
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        description="Are you sure? This will permanently delete the image from storage."
        loading={isDeleting}
      />
    </div>
  );
}
