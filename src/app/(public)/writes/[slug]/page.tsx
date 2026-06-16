import { novelService } from "@/lib/firebase/services/novelService";
import { novelBuilderService } from "@/lib/firebase/services/novelBuilderService";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, List } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const novel = await novelService.getNovelBySlug(slug);

  if (!novel) {
    return {
      title: "Novel Not Found",
    };
  }

  return {
    title: novel.seoTitle || `${novel.title} | StarMeyee`,
    description: novel.seoDescription || novel.description,
    openGraph: {
      title: novel.seoTitle || novel.title,
      description: novel.seoDescription || novel.description,
      images: novel.ogImage ? [novel.ogImage] : novel.coverImage ? [novel.coverImage] : [],
    },
  };
}

export default async function NovelLandingPage({ params }: Props) {
  const { slug } = await params;
  
  let novel = null;
  let publishedChapters = [];
  let firstChapter = null;
  let categoryMap: Record<string, string> = {};

  try {
    novel = await novelService.getNovelBySlug(slug);
    if (novel && novel.status === "published") {
      const [allChapters, allCategories] = await Promise.all([
        novelBuilderService.getChaptersForNovel(novel.id),
        novelService.getAllCategories(),
      ]);
      publishedChapters = allChapters.filter(c => c.published);
      firstChapter = publishedChapters[0];
      categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));
    }
  } catch (error) {
    console.error("Error loading novel data in WritesPage:", error);
  }

  if (!novel || novel.status !== "published") {
    notFound();
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          {novel.coverImage && (
            <Image
              src={novel.coverImage}
              alt=""
              fill
              className="object-cover blur-3xl opacity-30 dark:opacity-20 scale-110"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            {/* Cover Image */}
            <div className="w-full max-w-sm lg:w-1/3 shrink-0">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                {novel.coverImage ? (
                  <Image
                    src={novel.coverImage}
                    alt={novel.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-soft to-brand-secondary/30 flex items-center justify-center p-8">
                    <span className="font-oleo text-4xl text-brand-primary/50 text-center">{novel.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Novel Info */}
            <div className="w-full lg:w-2/3 flex flex-col items-center lg:items-start text-center lg:text-left">
              {novel.categories && novel.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                  {novel.categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="border-brand-accent/50 text-brand-accent backdrop-blur-sm">
                      {categoryMap[cat] || cat}
                    </Badge>
                  ))}
                </div>
              )}
              
              <h1 className="font-oleo text-5xl lg:text-7xl font-bold mb-6 text-foreground drop-shadow-sm">
                {novel.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed whitespace-pre-wrap">
                {novel.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-10 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-muted-foreground bg-white/5 dark:bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <List className="w-4 h-4 text-brand-accent" />
                  <span className="font-medium">{publishedChapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-white/5 dark:bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <BookOpen className="w-4 h-4 text-brand-accent" />
                  <span className="font-medium">Ongoing</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {firstChapter ? (
                  <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg bg-brand-accent hover:bg-brand-accent/90 text-white shadow-lg shadow-brand-accent/25 transition-all hover:scale-105">
                    <Link href={`/writes/${novel.slug}/chapter/${firstChapter.slug}`}>
                      Start Reading
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" disabled className="rounded-full px-8 py-6 text-lg bg-muted text-muted-foreground">
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="font-oleo text-4xl font-bold mb-4">Table of Contents</h2>
          <div className="h-1 w-20 bg-brand-accent rounded-full mx-auto lg:mx-0"></div>
        </div>

        {publishedChapters.length === 0 ? (
          <div className="text-center py-12 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-muted-foreground">No chapters available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publishedChapters.map((chapter, index) => (
              <Link 
                key={chapter.id} 
                href={`/writes/${novel.slug}/chapter/${chapter.slug}`}
                className="group flex items-center justify-between p-6 rounded-2xl bg-white/5 dark:bg-black/10 border border-white/10 hover:border-brand-accent/50 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-brand-soft/20 text-brand-accent font-oleo text-xl group-hover:bg-brand-accent group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground group-hover:text-brand-accent transition-colors mb-1">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-accent">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
