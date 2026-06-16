"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { novelBuilderService } from "@/lib/firebase/services/novelBuilderService";
import { novelService } from "@/lib/firebase/services/novelService";
import { Novel, NovelChapter, NovelPage } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, ArrowUp, ArrowDown, FileText } from "lucide-react";
import Link from "next/link";

export default function NovelBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: novelId } = use(params);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [pagesByChapter, setPagesByChapter] = useState<Record<string, NovelPage[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeChapterForPage, setActiveChapterForPage] = useState<string | null>(null);
  const [newPageTitle, setNewPageTitle] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const n = await novelService.getNovelById(novelId);
      setNovel(n);

      const chaps = await novelBuilderService.getChaptersForNovel(novelId);
      setChapters(chaps);

      const pagesObj: Record<string, NovelPage[]> = {};
      await Promise.all(
        chaps.map(async (chap) => {
          const pages = await novelBuilderService.getPagesForChapter(chap.id);
          pagesObj[chap.id] = pages;
        })
      );
      setPagesByChapter(pagesObj);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load novel data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (novelId) {
      fetchData();
    }
  }, [novelId]);

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const slug = newChapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const order = chapters.length;
      await novelBuilderService.createChapter({
        novelId,
        title: newChapterTitle,
        slug,
        displayOrder: order,
        published: false
      });
      toast.success("Chapter added");
      setIsChapterDialogOpen(false);
      setNewChapterTitle("");
      await fetchData();
    } catch (error) {
      toast.error("Failed to add chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapterForPage || !newPageTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const order = pagesByChapter[activeChapterForPage]?.length || 0;
      await novelBuilderService.createPage({
        chapterId: activeChapterForPage,
        title: newPageTitle,
        displayOrder: order,
        blocks: [],
        published: false
      });
      toast.success("Page added");
      setActiveChapterForPage(null);
      setNewPageTitle("");
      await fetchData();
    } catch (error) {
      toast.error("Failed to add page");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChapterPublished = async (chapter: NovelChapter) => {
    const next = !chapter.published;
    setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, published: next } : c));
    try {
      await novelBuilderService.updateChapter(chapter.id, { published: next });
      toast.success(next ? "Chapter published" : "Chapter set to draft");
    } catch (err) {
      toast.error("Failed to update chapter");
      await fetchData();
    }
  };

  const togglePagePublished = async (chapterId: string, page: NovelPage) => {
    const next = !page.published;
    setPagesByChapter(prev => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map(p => p.id === page.id ? { ...p, published: next } : p),
    }));
    try {
      await novelBuilderService.updatePage(page.id, { published: next });
      toast.success(next ? "Page published" : "Page set to draft");
    } catch (err) {
      toast.error("Failed to update page");
      await fetchData();
    }
  };

  const deleteChapter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter? This cannot be undone.")) return;
    try {
      await novelBuilderService.deleteChapter(id);
      toast.success("Chapter deleted");
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete chapter");
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await novelBuilderService.deletePage(id);
      toast.success("Page deleted");
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete page");
    }
  };

  const moveChapter = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === chapters.length - 1) return;

    const newChapters = [...chapters];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newChapters[index], newChapters[swapIndex]] = [newChapters[swapIndex], newChapters[index]];
    
    setChapters(newChapters);
    try {
      await novelBuilderService.reorderChapters(newChapters.map(c => c.id));
      toast.success("Chapters reordered");
    } catch (e) {
      toast.error("Failed to reorder chapters");
      await fetchData();
    }
  };

  const movePage = async (chapterId: string, index: number, direction: 'up' | 'down') => {
    const pages = pagesByChapter[chapterId] || [];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const newPages = [...pages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newPages[index], newPages[swapIndex]] = [newPages[swapIndex], newPages[index]];
    
    setPagesByChapter(prev => ({ ...prev, [chapterId]: newPages }));
    try {
      await novelBuilderService.reorderPages(newPages.map(p => p.id));
      toast.success("Pages reordered");
    } catch (e) {
      toast.error("Failed to reorder pages");
      await fetchData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{novel?.title} - Builder</h1>
          <p className="text-muted-foreground mt-1">Manage chapters and pages for this novel.</p>
        </div>
        
        <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddChapter} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="chapterTitle">Chapter Title</Label>
                <Input
                  id="chapterTitle"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: The Beginning"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !newChapterTitle.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Chapter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {chapters.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground">
            No chapters yet. Create one to get started!
          </div>
        ) : (
          chapters.map((chapter, chapIndex) => {
            const pages = pagesByChapter[chapter.id] || [];
            
            return (
              <Card key={chapter.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="text-muted-foreground font-mono text-sm border px-2 py-0.5 rounded bg-background">
                        #{chapIndex + 1}
                      </span>
                      {chapter.title}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-2 mr-2 px-2" title="Toggle published state (only published chapters appear on the site)">
                        <Switch
                          checked={chapter.published}
                          onCheckedChange={() => toggleChapterPublished(chapter)}
                          aria-label="Toggle chapter published"
                        />
                        <span className={`text-xs ${chapter.published ? "text-green-500" : "text-muted-foreground"}`}>
                          {chapter.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => moveChapter(chapIndex, 'up')} disabled={chapIndex === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveChapter(chapIndex, 'down')} disabled={chapIndex === chapters.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      {/* Placeholder for Edit Chapter */}
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteChapter(chapter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {pages.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4 italic">
                      No pages in this chapter.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pages.map((page, pageIndex) => (
                        <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{page.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" title="Toggle published (only published pages appear on the site)">
                              <Switch
                                checked={page.published}
                                onCheckedChange={() => togglePagePublished(chapter.id, page)}
                                aria-label="Toggle page published"
                              />
                              <span className={`text-[10px] uppercase tracking-wider ${page.published ? "text-green-500" : "text-muted-foreground"}`}>
                                {page.published ? "Live" : "Draft"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(chapter.id, pageIndex, 'up')} disabled={pageIndex === 0}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(chapter.id, pageIndex, 'down')} disabled={pageIndex === pages.length - 1}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deletePage(page.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Link href={`/admin/novels/${novelId}/builder/chapter/${chapter.id}/page/${page.id}`}>
                              <Button variant="secondary" size="sm" className="ml-2 gap-1 h-8">
                                <Edit className="h-3 w-3" /> Edit
                              </Button>
                            </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Dialog 
                    open={activeChapterForPage === chapter.id} 
                    onOpenChange={(open) => {
                      if (open) setActiveChapterForPage(chapter.id);
                      else setActiveChapterForPage(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2 border-dashed">
                        <Plus className="h-4 w-4 mr-2" /> Add Page
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Page to "{chapter.title}"</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPage} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="pageTitle">Page Title</Label>
                          <Input
                            id="pageTitle"
                            value={newPageTitle}
                            onChange={(e) => setNewPageTitle(e.target.value)}
                            placeholder="e.g. Page 1"
                            autoFocus
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setActiveChapterForPage(null)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting || !newPageTitle.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Page
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
