"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { novelService } from "@/lib/firebase/services/novelService";
import type { Novel } from "@/types";
import { ArrowRight, BookOpen } from "lucide-react";

interface FeaturedNovelSectionProps {
  content: Record<string, any>;
}

export default function FeaturedNovelSection({ content }: FeaturedNovelSectionProps) {
  const { title, subtitle } = content;
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
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-white/5 backdrop-blur-md border border-white/10 dark:bg-black/40 rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {novel.coverImage ? (
              <div className="relative aspect-[2/3] md:aspect-[3/4] rounded-xl overflow-hidden shadow-2xl group">
                <img
                  src={novel.coverImage}
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <div className="relative aspect-[2/3] md:aspect-[3/4] rounded-xl bg-gray-800 flex items-center justify-center shadow-2xl">
                <BookOpen className="w-20 h-20 text-gray-600" />
              </div>
            )}

            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium text-sm border border-indigo-500/20 mb-6">
                Featured Novel
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
                {title || novel.title}
              </h2>
              {subtitle && (
                <p className="text-xl text-indigo-400 mb-6 font-display italic">
                  {subtitle}
                </p>
              )}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-body leading-relaxed line-clamp-4">
                {novel.description}
              </p>
              
              <Link
                href={`/novels/${novel.slug}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-white text-black font-medium hover:bg-gray-100 transition-colors shadow-lg shadow-white/5"
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
