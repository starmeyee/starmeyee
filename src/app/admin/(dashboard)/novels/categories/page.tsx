"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { novelService } from "@/lib/firebase/services/novelService";
import { NovelCategory } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { DataTable } from "@/components/admin/cms/DataTable";
import { EmptyState } from "@/components/admin/cms/EmptyState";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2, Plus, Tags } from "lucide-react";

export default function NovelCategoriesPage() {
  const [categories, setCategories] = useState<NovelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetched = await novelService.getAllCategories();
      setCategories(fetched);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsAdding(true);
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const id = await novelService.createCategory({ name: newName, slug });
      
      setCategories([...categories, { id, name: newName, slug, createdAt: new Date() }]);
      setNewName("");
      toast.success("Category added");
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await novelService.deleteCategory(deleteId);
      setCategories(categories.filter(c => c.id !== deleteId));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="Novel Categories" 
        description="Manage the genres and categories for your stories."
      />

      <div className="bg-card border rounded-lg p-4">
        <form onSubmit={handleAdd} className="flex items-center gap-4">
          <Input 
            placeholder="New Category Name (e.g. Science Fiction)" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" disabled={isAdding || !newName.trim()} className="bg-brand-primary">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </form>
      </div>

      {!loading && categories.length === 0 ? (
        <EmptyState 
          icon={<Tags className="h-8 w-8 text-brand-primary" />}
          title="No Categories Yet"
          description="Create some initial categories. Suggested: Space, Astronomy, Science Fiction, Magic, Romance."
        />
      ) : (
        <DataTable columns={["Name", "Slug", "Date Added", "Actions"]} loading={loading}>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {cat.createdAt ? new Date((cat.createdAt as any)?.seconds ? (cat.createdAt as any).seconds * 1000 : cat.createdAt).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(cat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}

      <ConfirmDialog 
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Novels using it will keep the ID but lose the name."
        loading={isDeleting}
      />
    </div>
  );
}
