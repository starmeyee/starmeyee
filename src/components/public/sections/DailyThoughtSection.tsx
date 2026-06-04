"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { aiService, CosmicThought } from "@/lib/firebase/services/aiService";
import { Sparkles, Star } from "lucide-react";

export default function DailyThoughtSection() {
  const [thought, setThought] = useState<CosmicThought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThought() {
      try {
        const data = await aiService.getDailyThought();
        setThought(data);
      } catch (error) {
        console.error("Failed to fetch daily thought", error);
      } finally {
        setLoading(false);
      }
    }
    fetchThought();
  }, []);

  if (loading || !thought) return null;

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(123,31,162,0.15)] group overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-8 backdrop-blur-md">
              <Star className="w-4 h-4 fill-indigo-300 text-indigo-300" />
              <span className="text-sm font-medium tracking-wide">Cosmic Thought of the Day</span>
            </div>
            
            <p className="text-2xl md:text-4xl font-klee text-white/90 leading-relaxed italic drop-shadow-md mb-8">
              "{thought.thought}"
            </p>
            
            <div className="w-12 h-[1px] bg-white/20 mb-6" />
            
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-klee">
              <Sparkles className="w-4 h-4" />
              <span>Transmitted from the void • {new Date(thought.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
