"use client";

import { useState, useEffect, useCallback } from "react";
import { Novel, NovelChapter, NovelPage, ContentBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { subscriberService } from "@/lib/firebase/services/subscriberService";
import { readProgressService } from "@/lib/firebase/services/readProgressService";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReaderClientProps {
  novel: Novel;
  chapter: NovelChapter;
  pages: NovelPage[];
  nextChapterSlug?: string;
  prevChapterSlug?: string;
}

export function ReaderClient({ novel, chapter, pages, nextChapterSlug, prevChapterSlug }: ReaderClientProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentPage = pages[currentPageIndex];
  const progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  useEffect(() => {
    // Check if user has seen the email gate
    const hasSeen = localStorage.getItem("hasSeenEmailGate");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowEmailGate(true);
      }, 5000); // show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Save progress whenever page changes
    if (!currentPage) return;
    
    let userId = localStorage.getItem("readerUserId");
    if (!userId) {
      userId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("readerUserId", userId);
    }

    readProgressService.saveProgress(
      userId,
      novel.id,
      chapter.id,
      currentPage.id,
      progress
    ).catch(console.error);

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageIndex, currentPage, novel.id, chapter.id, progress]);

  const handleSubscribe = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      await subscriberService.addSubscriber(email);
      toast.success("Thank you for subscribing!");
      localStorage.setItem("hasSeenEmailGate", "true");
      setShowEmailGate(false);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipSubscribe = () => {
    localStorage.setItem("hasSeenEmailGate", "true");
    setShowEmailGate(false);
  };

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case "text":
        return (
          <p key={block.id} className="mb-6 text-xl leading-loose text-foreground/90 whitespace-pre-wrap font-klee">
            {block.content.text}
          </p>
        );
      case "image":
        return (
          <figure key={block.id} className="mb-8 mt-4 relative w-full flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
              {block.content.url && (
                <Image
                  src={block.content.url}
                  alt={block.content.caption || "Illustration"}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {block.content.caption && (
              <figcaption className="mt-3 text-sm text-muted-foreground italic text-center">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );
      case "quote":
        return (
          <blockquote key={block.id} className="mb-8 my-6 border-l-4 border-brand-accent pl-6 italic text-2xl text-foreground/80 font-klee py-2">
            "{block.content.text}"
            {block.content.author && (
              <footer className="text-base text-muted-foreground mt-2 font-sans not-italic">
                — {block.content.author}
              </footer>
            )}
          </blockquote>
        );
      case "callout":
        return (
          <div key={block.id} className="mb-8 p-6 rounded-2xl bg-brand-soft/20 dark:bg-brand-soft/10 border border-brand-primary/10 backdrop-blur-sm flex items-start gap-4">
            <div className="mt-1 text-brand-accent">
              <Info className="w-6 h-6" />
            </div>
            <div className="text-lg text-foreground/90 font-klee leading-relaxed">
              {block.content.text}
            </div>
          </div>
        );
      case "divider":
        return (
          <hr key={block.id} className="my-12 border-t border-border/50 w-24 mx-auto" />
        );
      default:
        return null;
    }
  };

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No content available for this chapter.</p>
      </div>
    );
  }

  // Sort blocks by order just in case
  const sortedBlocks = [...currentPage.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background selection:bg-brand-accent/20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-muted">
        <div 
          className="h-full bg-brand-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header Context */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/writes/${novel.slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px] sm:max-w-xs">
            {novel.title}
          </Link>
          <div className="text-sm font-semibold text-foreground truncate ml-4">
            {chapter.title}
          </div>
        </div>
      </header>

      {/* Reading Container */}
      <main className="max-w-2xl mx-auto px-6 py-12 lg:py-20">
        <h1 className="text-3xl font-oleo mb-10 text-center text-brand-primary dark:text-brand-soft">{currentPage.title || `Page ${currentPageIndex + 1}`}</h1>
        
        <article className="space-y-6 max-w-none pb-12">
          {sortedBlocks.map(renderBlock)}
        </article>

        {/* Navigation */}
        <nav className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          {currentPageIndex > 0 ? (
            <Button variant="outline" onClick={() => setCurrentPageIndex(p => p - 1)} className="w-full sm:w-auto gap-2 rounded-full">
              <ChevronLeft className="w-4 h-4" /> Previous Page
            </Button>
          ) : prevChapterSlug ? (
            <Button variant="outline" asChild className="w-full sm:w-auto gap-2 rounded-full">
              <Link href={`/writes/${novel.slug}/chapter/${prevChapterSlug}`}>
                <ChevronLeft className="w-4 h-4" /> Previous Chapter
              </Link>
            </Button>
          ) : (
            <div className="hidden sm:block"></div>
          )}

          <div className="text-sm text-muted-foreground">
            {currentPageIndex + 1} / {pages.length}
          </div>

          {currentPageIndex < pages.length - 1 ? (
            <Button onClick={() => setCurrentPageIndex(p => p + 1)} className="w-full sm:w-auto gap-2 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-white">
              Next Page <ChevronRight className="w-4 h-4" />
            </Button>
          ) : nextChapterSlug ? (
            <Button asChild className="w-full sm:w-auto gap-2 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-white">
              <Link href={`/writes/${novel.slug}/chapter/${nextChapterSlug}`}>
                Next Chapter <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full sm:w-auto gap-2 rounded-full">
              <Link href={`/writes/${novel.slug}`}>
                Back to Book <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </nav>
      </main>

      {/* Email Gate Modal */}
      <Dialog open={showEmailGate} onOpenChange={setShowEmailGate}>
        <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-oleo text-3xl text-center mb-2">Join the Story</DialogTitle>
            <DialogDescription className="text-center text-base">
              Subscribe to get notified about new chapters, exclusive behind-the-scenes, and more from this world.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-4 py-6"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3 sm:space-x-0">
            <Button 
              onClick={handleSubscribe} 
              disabled={isSubmitting || !email.includes('@')}
              className="w-full rounded-full py-6 bg-brand-accent hover:bg-brand-accent/90 text-white text-lg"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSkipSubscribe}
              className="w-full rounded-full text-muted-foreground hover:text-foreground"
            >
              Continue Reading (Skip)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
