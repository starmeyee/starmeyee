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
              <h2 className="text-3xl md:text-5xl font-oleo font-bold text-white mb-6">
                {title || "Who am I?"}
              </h2>
              <p className="text-lg text-white/80 mb-8 font-klee leading-relaxed">
                {description ||
                  "A brief introduction about the creator, the vision, and the journey that led to StarMeyee. Discover the mind behind the cosmos."}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors text-white font-medium shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              >
                Read full story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(123,31,162,0.3)] border border-white/10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl || "/profile.jpeg"}
                alt="About StarMeyee"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
