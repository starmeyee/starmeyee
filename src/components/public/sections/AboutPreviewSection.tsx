"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutPreviewSectionProps {
  content: Record<string, any>;
}

export default function AboutPreviewSection({ content }: AboutPreviewSectionProps) {
  const { title, description, imageUrl } = content;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-white/5 backdrop-blur-md border border-white/10 dark:bg-black/40 rounded-3xl p-8 md:p-12 overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
                {title || "Who am I?"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-body leading-relaxed">
                {description ||
                  "A brief introduction about the creator, the vision, and the journey that led to StarMeyee. Discover the mind behind the cosmos."}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white font-medium"
              >
                Read full story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {imageUrl && (
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt="About preview"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
