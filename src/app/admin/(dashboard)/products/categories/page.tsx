"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productService } from "@/lib/firebase/services/productService";
import { ProductCategory } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { DataTable } from "@/components/admin/cms/DataTable";
import { EmptyState } from "@/components/admin/cms/EmptyState";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2, Plus, Tags } from "lucide-react";

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
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
      const fetched = await productService.getAllCategories();
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
      const id = await productService.createCategory({ name: newName, slug });
      
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
      await productService.deleteCategory(deleteId);
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
        title="Product Categories" 
        description="Organize your store items into categories."
      />

      <div className="bg-card border rounded-lg p-4">
        <form onSubmit={handleAdd} className="flex items-center gap-4">
          <Input 
            placeholder="New Category Name (e.g. Digital Art)" 
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
          description="Create some initial categories for your products."
        />
      ) : (
        <DataTable columns={["Name", "Slug", "Date Added", "Actions"]} loading={loading}>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {cat.createdAt ? new Date(cat.createdAt as any?.seconds ? (cat.createdAt as any).seconds * 1000 : cat.createdAt).toLocaleDateString() : 'Unknown'}
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
        description="Are you sure you want to delete this category? Products using it will keep the ID but lose the name."
        loading={isDeleting}
      />
    </div>
  );
}
