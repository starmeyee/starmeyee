"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { productService } from "@/lib/firebase/services/productService";
import { Product } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { DataTable } from "@/components/admin/cms/DataTable";
import { StatusBadge } from "@/components/admin/cms/StatusBadge";
import { ConfirmDialog } from "@/components/admin/cms/ConfirmDialog";
import { EmptyState } from "@/components/admin/cms/EmptyState";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Edit, Trash2, ShoppingBag } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fetched = await productService.getAllProducts();
      setProducts(fetched);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteId);
      setProducts(products.filter(p => p.id !== deleteId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === "published") return p.status === "published";
    if (filter === "drafts") return p.status === "draft";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products" 
        description="Manage your merchandise and digital products."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/products/categories">
              <Button variant="outline">Categories</Button>
            </Link>
            <Link href="/admin/products/new">
              <Button>New Product</Button>
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

      {!loading && products.length === 0 ? (
        <EmptyState 
          icon={<ShoppingBag className="h-8 w-8 text-brand-primary" />}
          title="No Products Yet"
          description="Create your first products to display them here. Known products to add later: 'Art Book', 'Guide On How To Express Yourself', 'What's A True Religion'."
        />
      ) : (
        <DataTable 
          columns={["Cover", "Title", "Price", "Status", "Featured", "Gumroad", "Date", "Actions"]} 
          loading={loading}
        >
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.coverImage ? (
                  <img src={product.coverImage} alt={product.title} className="h-10 w-10 object-cover rounded shadow-sm" />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded shadow-sm flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/admin/products/${product.id}/edit`} className="hover:underline text-brand-primary">
                  {product.title}
                </Link>
              </TableCell>
              <TableCell>₹{product.price}</TableCell>
              <TableCell>
                <StatusBadge status={product.status} />
              </TableCell>
              <TableCell>
                {product.featured && <Check className="h-4 w-4 text-green-500" />}
              </TableCell>
              <TableCell>
                {product.gumroadLink ? (
                  <a href={product.gumroadLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-muted px-2 py-1 rounded-full text-brand-accent hover:underline">
                    Link
                  </a>
                ) : <span className="text-muted-foreground text-xs">None</span>}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {product.createdAt ? new Date((product.createdAt as any)?.seconds ? (product.createdAt as any).seconds * 1000 : product.createdAt).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(product.id)}
                  >
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
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}
