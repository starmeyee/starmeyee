"use client";

import { useEffect, useState } from "react";
import { homepageService } from "@/lib/firebase/services/homepageService";
import type { HomepageSection as HomepageSectionType } from "@/types";

import HeroSection from "@/components/public/sections/HeroSection";
import AboutPreviewSection from "@/components/public/sections/AboutPreviewSection";
import FeaturedNovelSection from "@/components/public/sections/FeaturedNovelSection";
import MusicPreviewSection from "@/components/public/sections/MusicPreviewSection";
import GalleryPreviewSection from "@/components/public/sections/GalleryPreviewSection";
import NewsletterSection from "@/components/public/sections/NewsletterSection";
import ThingsILoveSection from "@/components/public/sections/ThingsILoveSection";

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSectionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSections() {
      try {
        const allSections = await homepageService.getAllSections();
        const activeSections = allSections
          .filter((sec) => sec.enabled)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setSections(activeSections);
      } catch (error) {
        console.error("Error fetching homepage sections:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const renderSection = (section: HomepageSectionType) => {
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
            <h2 className="text-3xl font-display font-bold text-white">{section.title}</h2>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {sections.map(renderSection)}
      
      {/* Fallback if no sections exist yet */}
      {sections.length === 0 && (
        <HeroSection 
          content={{
            title: "Exploring the Wonders of the Universe and the Mind",
            description: "Welcome to StarMeyee, a journey through cosmos, culture, and curiosity.",
            primaryButtonText: "Begin the Journey",
            primaryButtonLink: "/about",
            secondaryButtonText: "View Observatory",
            secondaryButtonLink: "/observatory"
          }}
        />
      )}
    </main>
  );
}
