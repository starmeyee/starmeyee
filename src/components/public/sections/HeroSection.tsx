"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface HeroSectionProps {
  content: Record<string, any>;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { headline, subheadline, backgroundImage, ctaButtons } = content;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image / Parallax */}
      {backgroundImage ? (
        <motion.div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black" />
      )}

      {/* Cosmic Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px]" />

      <motion.div
        className="relative z-20 text-center px-4 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          {headline || "Welcome to StarMeyee"}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-10 font-body font-light drop-shadow-md">
          {subheadline || "Explore the universe of thoughts."}
        </p>

        {ctaButtons && Array.isArray(ctaButtons) && ctaButtons.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaButtons.map((btn: any, idx: number) => (
              <Link
                key={idx}
                href={btn.link || "/"}
                className={`px-8 py-3 rounded-full backdrop-blur-md border transition-all duration-300 font-medium ${
                  idx === 0
                    ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                    : "bg-black/20 border-white/10 text-white/90 hover:bg-black/40 hover:text-white"
                }`}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
