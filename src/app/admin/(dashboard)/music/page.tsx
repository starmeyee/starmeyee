"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { musicService } from "@/lib/firebase/services/musicService";
import { storageService } from "@/lib/firebase/services/storage";
import { MusicItem } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { DataTable } from "@/components/admin/cms/DataTable";
import { EmptyState } from "@/components/admin/cms/EmptyState";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Music, Plus, Edit, Trash2, Camera, Loader2, Check } from "lucide-react";

export default function MusicPage() {
  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    songTitle: "",
    artist: "",
    album: "",
    spotifyLink: "",
    featured: false,
    displayOrder: 0,
    coverImage: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const fetched = await musicService.getAllMusicItems();
      setItems(fetched);
    } catch (error) {
      toast.error("Failed to load music");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const openNewDialog = () => {
    setFormData({ id: "", songTitle: "", artist: "", album: "", spotifyLink: "", featured: false, displayOrder: items.length, coverImage: "" });
    setCoverFile(null);
    setCoverPreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MusicItem) => {
    setFormData({
      id: item.id,
      songTitle: item.songTitle,
      artist: item.artist,
      album: item.album || "",
      spotifyLink: item.spotifyLink || "",
      featured: item.featured,
      displayOrder: item.displayOrder,
      coverImage: item.coverImage || ""
    });
    setCoverFile(null);
    setCoverPreview(item.coverImage);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalCover = formData.coverImage;
      if (coverFile) {
        const path = `music/${Date.now()}_${coverFile.name}`;
        finalCover = await storageService.uploadFile(path, coverFile);
      }

      const payload = {
        songTitle: formData.songTitle,
        artist: formData.artist,
        album: formData.album,
        spotifyLink: formData.spotifyLink,
        featured: formData.featured,
        displayOrder: Number(formData.displayOrder),
        coverImage: finalCover
      };

      if (formData.id) {
        await musicService.updateMusicItem(formData.id, payload);
        toast.success("Song updated");
      } else {
        await musicService.createMusicItem(payload);
        toast.success("Song added");
      }
      
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      toast.error("Failed to save song");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await musicService.deleteMusicItem(deleteId);
      setItems(items.filter(i => i.id !== deleteId));
      toast.success("Song deleted");
    } catch (error) {
      toast.error("Failed to delete song");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Music Collection" 
        description="Curate your personal cosmic playlist."
        action={
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Song
          </Button>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Song" : "Add Song"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="flex gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/20 cursor-pointer overflow-hidden hover:bg-muted/40 transition-colors relative"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Song Title *</Label>
                  <Input value={formData.songTitle} onChange={e => setFormData({...formData, songTitle: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Artist *</Label>
                  <Input value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Album</Label>
                <Input value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Spotify Link</Label>
              <Input type="url" placeholder="https://open.spotify.com/track/..." value={formData.spotifyLink} onChange={e => setFormData({...formData, spotifyLink: e.target.value})} />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-md">
              <Label className="text-sm">Featured</Label>
              <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!loading && items.length === 0 ? (
        <EmptyState 
          icon={<Music className="h-8 w-8 text-brand-primary" />}
          title="Empty Playlist"
          description="Start building your music collection. Known favorites: RADWIMPS, Fujii Kaze, YOASOBI, imase, Yuika"
          actionLabel="Add Song"
          onAction={openNewDialog}
        />
      ) : (
        <DataTable columns={["Cover", "Song", "Artist", "Album", "Featured", "Order", "Link", "Actions"]} loading={loading}>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.songTitle} className="h-10 w-10 object-cover rounded shadow-sm" />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded shadow-sm flex items-center justify-center">
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.songTitle}</TableCell>
              <TableCell>{item.artist}</TableCell>
              <TableCell className="text-muted-foreground">{item.album}</TableCell>
              <TableCell>
                {item.featured && <Check className="h-4 w-4 text-green-500" />}
              </TableCell>
              <TableCell>{item.displayOrder}</TableCell>
              <TableCell>
                {item.spotifyLink ? (
                  <a href={item.spotifyLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-muted px-2 py-1 rounded-full text-brand-accent hover:underline">
                    Spotify
                  </a>
                ) : <span className="text-muted-foreground text-xs">None</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-primary" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}

      <ConfirmDialog 
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Song"
        description="Are you sure you want to remove this song from the collection?"
        loading={isDeleting}
      />
    </div>
  );
}
