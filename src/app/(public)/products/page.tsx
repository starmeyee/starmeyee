import { productService } from "@/lib/firebase/services/productService";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ExternalLink } from "lucide-react";
import type { Product } from "@/types";

export const metadata = {
  title: "Store | StarMeyee",
  description: "Explore books, art, and digital creations by StarMeyee.",
};

export default async function ProductsPage() {
  let publishedProducts: Product[] = [];
  let categoryMap: Record<string, string> = {};
  try {
    const [allProducts, allCategories] = await Promise.all([
      productService.getAllProducts(),
      productService.getAllCategories(),
    ]);
    publishedProducts = allProducts.filter((p) => p.status === "published");
    categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
  } catch (error) {
    console.error("Error fetching products for store page:", error);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-oleo text-5xl font-bold text-white mb-4">The Store</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Books, art, and digital creations born from stardust and imagination.
        </p>
      </div>

      {publishedProducts.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <ShoppingBag className="h-10 w-10 mx-auto mb-4 opacity-40" />
          <p>No products available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedProducts.map((product) => (
            <div
              key={product.id}
              className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
            >
              {product.coverImage ? (
                <div className="relative w-full aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-gradient-to-br from-brand-soft to-brand-secondary/30 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-brand-primary/40" />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <h2 className="font-oleo text-2xl font-bold mb-2 text-white group-hover:text-brand-accent transition-colors">
                  {product.title}
                </h2>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                  {product.description}
                </p>

                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories.map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-brand-soft/50 text-brand-primary">
                        {categoryMap[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-oleo text-xl text-white">
                    {product.price > 0 ? `₹${product.price}` : "Free"}
                  </span>
                  {product.gumroadLink ? (
                    <a
                      href={product.gumroadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-medium hover:bg-brand-accent transition-colors"
                    >
                      Get it
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
