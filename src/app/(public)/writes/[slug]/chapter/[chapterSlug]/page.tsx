import { novelService } from "@/lib/firebase/services/novelService";
import { novelBuilderService } from "@/lib/firebase/services/novelBuilderService";
import { notFound } from "next/navigation";
import { ReaderClient } from "./ReaderClient";

type Props = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterSlug } = await params;
  
  let novel = null;
  let chapter = null;
  let publishedPages = [];
  let publishedChapters = [];

  try {
    // Stage 1: Fetch novel and chapter in parallel
    const [fetchedNovel, fetchedChapter] = await Promise.all([
      novelService.getNovelBySlug(slug),
      novelBuilderService.getChapterBySlug(chapterSlug)
    ]);

    novel = fetchedNovel;
    chapter = fetchedChapter;

    if (novel && chapter && chapter.novelId === novel.id && chapter.published) {
      // Stage 2: Fetch pages and chapters list in parallel
      const [fetchedPages, fetchedChapters] = await Promise.all([
        novelBuilderService.getPagesForChapter(chapter.id),
        novelBuilderService.getChaptersForNovel(novel.id)
      ]);

      publishedPages = fetchedPages.filter(p => p.published).sort((a, b) => a.displayOrder - b.displayOrder);
      publishedChapters = fetchedChapters.filter(c => c.published).sort((a, b) => a.displayOrder - b.displayOrder);
    }
  } catch (error) {
    console.error("Error loading chapter data:", error);
  }
  
  if (!novel || !chapter || chapter.novelId !== novel.id || !chapter.published) {
    notFound();
  }

  const currentChapterIndex = publishedChapters.findIndex(c => c.id === chapter.id);
  const nextChapter = publishedChapters[currentChapterIndex + 1];
  const prevChapter = publishedChapters[currentChapterIndex - 1];

  return (
    <ReaderClient 
      novel={novel}
      chapter={chapter}
      pages={publishedPages}
      nextChapterSlug={nextChapter?.slug}
      prevChapterSlug={prevChapter?.slug}
    />
  );
}

