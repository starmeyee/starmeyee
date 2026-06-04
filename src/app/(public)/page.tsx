import { homepageService } from "@/lib/firebase/services/homepageService";
import type { HomepageSection as HomepageSectionType } from "@/types";

import HeroSection from "@/components/public/sections/HeroSection";
import AboutPreviewSection from "@/components/public/sections/AboutPreviewSection";
import FeaturedNovelSection from "@/components/public/sections/FeaturedNovelSection";
import MusicPreviewSection from "@/components/public/sections/MusicPreviewSection";
import GalleryPreviewSection from "@/components/public/sections/GalleryPreviewSection";
import NewsletterSection from "@/components/public/sections/NewsletterSection";
import ThingsILoveSection from "@/components/public/sections/ThingsILoveSection";

export default async function HomePage() {
  let sections: HomepageSectionType[] = [];
  try {
    const allSections = await homepageService.getAllSections();
    sections = allSections
      .filter((sec) => sec.enabled)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
  }

  // If no sections are configured in CMS, we render the entire narrative flow as a fallback placeholder.
  const isFallback = sections.length === 0;

  return (
    <main className="min-h-screen relative text-white selection:bg-indigo-500/30 pb-12">
      {isFallback ? (
        <>
          <HeroSection />
          <AboutPreviewSection content={{
            title: "Who Is StarMeyee?",
            description: "A dreamer navigating the infinite expanse of both the cosmos and the human imagination. I am deeply fascinated by the hidden mechanics of the universe, the quiet beauty of traditional philosophies, and the boundless possibilities of science fiction."
          }} />
          <ThingsILoveSection />
          <FeaturedNovelSection content={{}} />
          <MusicPreviewSection />
          <GalleryPreviewSection />
          <NewsletterSection />
        </>
      ) : (
        sections.map((section) => {
          const combinedContent = { ...section.content, title: section.title };
          
          switch (section.type) {
            case "hero":
              return <HeroSection key={section.id} content={combinedContent} />;
            case "about_preview":
              return <AboutPreviewSection key={section.id} content={combinedContent} />;
            case "featured_novel":
              return <FeaturedNovelSection key={section.id} content={combinedContent} />;
            case "music_preview":
              return <MusicPreviewSection key={section.id} content={combinedContent} />;
            case "gallery_preview":
              return <GalleryPreviewSection key={section.id} content={combinedContent} />;
            case "newsletter":
              return <NewsletterSection key={section.id} content={combinedContent} />;
            case "custom":
              if (section.title?.toLowerCase().includes("love")) {
                return <ThingsILoveSection key={section.id} content={combinedContent} />;
              }
              return (
                <section key={section.id} className="py-24 px-6 text-center">
                  <h2 className="text-3xl font-oleo font-bold text-white">{section.title}</h2>
                </section>
              );
            default:
              return null;
          }
        })
      )}
    </main>
  );
}
