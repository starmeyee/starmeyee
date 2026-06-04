"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Telescope, BookOpen } from "lucide-react";

interface HeroSectionProps {
  content?: Record<string, any>;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const headline = content?.headline || content?.title || "A Curious Mind Wandering Between Stars, Ideas, and Possibilities.";
  const subheadline = content?.subheadline || content?.description || "Welcome to StarMeyee. A personal universe dedicated to astronomy, philosophy, Japanese aesthetics, and storytelling.";
  const primaryButtonText = content?.primaryButtonText || "Begin the Journey";
  const primaryButtonLink = content?.primaryButtonLink || "/about";
  const secondaryButtonText = content?.secondaryButtonText || "View Observatory";
  const secondaryButtonLink = content?.secondaryButtonLink || "/observatory";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* We do NOT have a solid background here so it naturally integrates with the global CosmicBackground */}
      
      {/* Subtle floating effects specifically for the hero focus area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <motion.div
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mb-8 flex justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 backdrop-blur-md">
            <Telescope className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Astronomy</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 backdrop-blur-md">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Storytelling</span>
          </div>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-oleo text-white mb-8 leading-[1.1] drop-shadow-2xl">
          {headline}
        </h1>
        
        <p className="text-xl md:text-2xl text-white/70 mb-12 font-klee font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href={primaryButtonLink}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {primaryButtonText}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <Link
            href={secondaryButtonLink}
            className="px-8 py-4 bg-white/5 border border-white/20 text-white/90 hover:text-white hover:bg-white/10 hover:border-white/40 rounded-full font-medium text-lg backdrop-blur-md transition-all duration-300"
          >
            {secondaryButtonText}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
