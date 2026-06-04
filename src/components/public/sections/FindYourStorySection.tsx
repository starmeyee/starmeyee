"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowRight, Loader2, BookOpen, ShoppingBag, PenTool } from "lucide-react";
import Link from "next/link";
import { useCompletion } from "@ai-sdk/react";

export default function FindYourStorySection() {
  const [feeling, setFeeling] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const { completion, complete, error } = useCompletion({
    api: "/api/recommend",
    streamProtocol: "text",
    onFinish: () => setIsSearching(false),
    onError: () => setIsSearching(false),
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling.trim()) return;
    setIsSearching(true);
    await complete(feeling, { body: { feeling } });
  };

  // Parse the structured text from Groq
  // Format expected: "Type: [Novel/Product/Article] | Title: [Title] | Url: [Url] | Reason: [Reason]"
  let parsedRecommendation = null;
  if (completion) {
    try {
      const parts = completion.split("|").map(p => p.trim());
      if (parts.length >= 4) {
        parsedRecommendation = {
          type: parts[0].replace("Type:", "").trim(),
          title: parts[1].replace("Title:", "").trim(),
          url: parts[2].replace("Url:", "").trim(),
          reason: parts[3].replace("Reason:", "").trim(),
        };
      }
    } catch (e) {
      console.error("Failed to parse recommendation", e);
    }
  }

  return (
    <section className="py-32 px-6 relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-16 shadow-[0_0_50px_rgba(168,85,247,0.1)] group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-[200%] h-[200%] translate-x-[20%] -translate-y-[20%] bg-[radial-gradient(ellipse_at_center,_rgba(123,31,162,0.1)_0%,_rgba(0,0,0,0)_50%)] pointer-events-none opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-8 backdrop-blur-md">
              <Compass className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium tracking-wide">Find Your Story</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-oleo font-bold text-white mb-6 drop-shadow-lg">
              How are you feeling today?
            </h2>
            
            <p className="text-lg text-white/60 font-klee mb-10 max-w-xl mx-auto">
              Share your mood, your thoughts, or what you're seeking, and the universe will guide you to a story, creation, or thought perfectly aligned with your spirit.
            </p>
            
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-12">
              <input
                type="text"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="I am feeling a bit lost in the noise..."
                className="w-full bg-white/5 border border-white/20 rounded-full px-8 py-5 text-white placeholder:text-white/30 font-klee text-lg outline-none focus:border-purple-400 focus:bg-white/10 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isSearching || !feeling.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {parsedRecommendation && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="w-full max-w-2xl text-left bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {parsedRecommendation.type.toLowerCase().includes("novel") ? <BookOpen className="w-5 h-5 text-purple-400" /> :
                     parsedRecommendation.type.toLowerCase().includes("product") ? <ShoppingBag className="w-5 h-5 text-purple-400" /> :
                     <PenTool className="w-5 h-5 text-purple-400" />}
                    <span className="text-purple-400 font-medium tracking-wider uppercase text-sm">{parsedRecommendation.type}</span>
                  </div>
                  
                  <h3 className="text-3xl font-oleo text-white mb-4">{parsedRecommendation.title}</h3>
                  <p className="text-white/70 font-klee text-lg leading-relaxed mb-8">
                    "{parsedRecommendation.reason}"
                  </p>
                  
                  <Link 
                    href={parsedRecommendation.url}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white font-klee"
                  >
                    Explore This Path <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
              <p className="text-red-400 font-klee mt-4">The stars are clouded right now. Try again later.</p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
