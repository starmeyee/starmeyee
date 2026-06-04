"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { novelService } from "@/lib/firebase/services/novelService";
import type { Novel } from "@/types";
import { ArrowRight, BookOpen } from "lucide-react";

interface FeaturedNovelSectionProps {
  content?: Record<string, any>;
}

export default function FeaturedNovelSection({ content }: FeaturedNovelSectionProps) {
  const title = content?.title;
  const subtitle = content?.subtitle;
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNovel() {
      try {
        const novels = await novelService.getAllNovels();
        const featured = novels.find((n) => n.featured && n.status === "published");
        if (featured) {
          setNovel(featured);
        } else if (novels.length > 0) {
          setNovel(novels[0]);
        } else {
          // Elegant Fallback
          setNovel({
            id: "fallback",
            title: "Whispers of the Cosmos",
            slug: "whispers-of-the-cosmos",
            description: "A narrative journey through the life of a young astronomer who discovers that the universe communicates through the delicate threads of human connection and quiet philosophical moments.",
            status: "published",
            coverImage: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1000&auto=format&fit=crop",
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Novel);
        }
      } catch (error) {
        console.error("Error fetching featured novel:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNovel();
  }, []);

  if (loading || !novel) return null;

  return (
    <section className="py-24 px-6 relative overflow-hidden z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {novel.coverImage ? (
              <div className="relative aspect-[2/3] md:aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(123,31,162,0.3)] group border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={novel.coverImage}
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <div className="relative aspect-[2/3] md:aspect-[3/4] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(123,31,162,0.1)]">
                <BookOpen className="w-20 h-20 text-white/20" />
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 font-medium text-sm border border-purple-500/20 mb-6 backdrop-blur-md">
                <BookOpen className="w-4 h-4" />
                Featured Story
              </div>
              <h2 className="text-3xl md:text-5xl font-oleo font-bold text-white mb-4 drop-shadow-lg">
                {title || novel.title}
              </h2>
              {subtitle && (
                <p className="text-xl text-purple-300 mb-6 font-oleo italic drop-shadow-md">
                  {subtitle}
                </p>
              )}
              <p className="text-lg text-white/70 mb-8 font-klee leading-relaxed line-clamp-4">
                {novel.description}
              </p>
              
              <Link
                href={`/writes/${novel.slug}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md"
              >
                Start Reading
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
