"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { novelService } from "@/lib/firebase/services/novelService";
import { Novel, NovelCategory } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { DataTable } from "@/components/admin/cms/DataTable";
import { StatusBadge } from "@/components/admin/cms/StatusBadge";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Edit, Trash2 } from "lucide-react";

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedNovels, fetchedCats] = await Promise.all([
        novelService.getAllNovels(),
        novelService.getAllCategories()
      ]);
      setNovels(fetchedNovels);
      
      const catMap: Record<string, string> = {};
      fetchedCats.forEach(c => { catMap[c.id] = c.name; });
      setCategories(catMap);
    } catch (error) {
      toast.error("Failed to load novels");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await novelService.deleteNovel(deleteId);
      setNovels(novels.filter(n => n.id !== deleteId));
      toast.success("Novel deleted successfully");
    } catch (error) {
      toast.error("Failed to delete novel");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredNovels = novels.filter(n => {
    if (filter === "published") return n.status === "published";
    if (filter === "drafts") return n.status === "draft";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Novels" 
        description="Manage your stories and novel content."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/novels/categories">
              <Button variant="outline">Categories</Button>
            </Link>
            <Link href="/admin/novels/new">
              <Button>New Novel</Button>
            </Link>
          </div>
        }
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable 
        columns={["Cover", "Title", "Status", "Categories", "Featured", "Date", "Actions"]} 
        loading={loading}
      >
        {filteredNovels.map((novel) => (
          <TableRow key={novel.id}>
            <TableCell>
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="h-14 w-10 object-cover rounded shadow-sm" />
              ) : (
                <div className="h-14 w-10 bg-muted rounded shadow-sm" />
              )}
            </TableCell>
            <TableCell className="font-medium">
              <Link href={`/admin/novels/${novel.id}/edit`} className="hover:underline text-brand-primary">
                {novel.title}
              </Link>
              <div className="text-xs text-muted-foreground mt-1">{novel.slug}</div>
            </TableCell>
            <TableCell>
              <StatusBadge status={novel.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {novel.categories.map(cid => (
                  <span key={cid} className="text-xs bg-muted px-2 py-1 rounded-full whitespace-nowrap">
                    {categories[cid] || cid}
                  </span>
                ))}
                {novel.categories.length === 0 && <span className="text-muted-foreground text-xs">None</span>}
              </div>
            </TableCell>
            <TableCell>
              {novel.featured && <Check className="h-4 w-4 text-green-500" />}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {novel.createdAt ? new Date((novel.createdAt as any)?.seconds ? (novel.createdAt as any).seconds * 1000 : novel.createdAt).toLocaleDateString() : 'Unknown'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Link href={`/admin/novels/${novel.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-primary">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(novel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <ConfirmDialog 
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Novel"
        description="Are you sure you want to delete this novel? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}
