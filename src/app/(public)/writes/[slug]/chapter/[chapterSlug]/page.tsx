import { novelService } from "@/lib/firebase/services/novelService";
import { novelBuilderService } from "@/lib/firebase/services/novelBuilderService";
import { notFound } from "next/navigation";
import { ReaderClient } from "./ReaderClient";

type Props = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterSlug } = await params;
  
  const novel = await novelService.getNovelBySlug(slug);
  if (!novel) notFound();

  const chapter = await novelBuilderService.getChapterBySlug(chapterSlug);
  if (!chapter || chapter.novelId !== novel.id || !chapter.published) {
    notFound();
  }

  const pages = await novelBuilderService.getPagesForChapter(chapter.id);
  const publishedPages = pages.filter(p => p.published).sort((a, b) => a.displayOrder - b.displayOrder);

  // Fetch all chapters to find next/prev
  const allChapters = await novelBuilderService.getChaptersForNovel(novel.id);
  const publishedChapters = allChapters.filter(c => c.published).sort((a, b) => a.displayOrder - b.displayOrder);
  
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
