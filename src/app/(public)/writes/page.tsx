import { novelService } from "@/lib/firebase/services/novelService";
import Link from "next/link";
import Image from "next/image";
import { Novel } from "@/types";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Library | StarMeyee",
  description: "Explore the collection of novels by StarMeyee.",
};

export default async function WritesPage() {
  let publishedNovels = [];
  let categoryMap: Record<string, string> = {};
  try {
    const [allNovels, allCategories] = await Promise.all([
      novelService.getAllNovels(),
      novelService.getAllCategories(),
    ]);
    publishedNovels = allNovels.filter(n => n.status === "published");
    categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));
  } catch (error) {
    console.error("Error fetching novels for library page:", error);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-oleo text-5xl font-bold text-foreground mb-4">The Library</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Immerse yourself in worlds of wonder, love, and mystery. Explore our curated collection of stories.
        </p>
      </div>

      {publishedNovels.length === 0 ? (

        <div className="text-center text-muted-foreground py-20">
          <p>No novels available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedNovels.map((novel) => (
            <Link key={novel.id} href={`/writes/${novel.slug}`}>
              <div className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                {novel.coverImage ? (
                  <div className="relative w-full aspect-[2/3] overflow-hidden">
                    <Image
                      src={novel.coverImage}
                      alt={novel.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-brand-soft to-brand-secondary/30 flex items-center justify-center">
                    <span className="font-oleo text-2xl text-brand-primary/50 text-center px-4">{novel.title}</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-oleo text-2xl font-bold mb-2 text-foreground group-hover:text-brand-accent transition-colors">
                    {novel.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {novel.description}
                  </p>
                  {novel.categories && novel.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {novel.categories.map((cat, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-brand-soft/50 text-brand-primary">
                          {categoryMap[cat] || cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
