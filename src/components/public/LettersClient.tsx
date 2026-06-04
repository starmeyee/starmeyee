"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { Sparkles, Moon, Sun, Cloud, Wind, Waves, Star, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const MOODS = [
  { id: "lost", label: "Lost", icon: Cloud, color: "text-gray-300" },
  { id: "curious", label: "Curious", icon: Star, color: "text-yellow-300" },
  { id: "dreaming", label: "Dreaming", icon: Moon, color: "text-purple-300" },
  { id: "hopeful", label: "Hopeful", icon: Sun, color: "text-orange-300" },
  { id: "overthinking", label: "Overthinking", icon: Wind, color: "text-blue-300" },
  { id: "wondering", label: "Wondering", icon: Waves, color: "text-teal-300" },
];

export default function LettersClient() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { completion, complete, error } = useCompletion({
    api: "/api/letters/generate",
    onFinish: () => setIsGenerating(false),
    onError: (err) => {
      setIsGenerating(false);
      toast.error(err.message || "Failed to receive transmission.");
    }
  });

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    setIsGenerating(true);
    await complete(moodId, { body: { mood: moodId } });
  };

  const handleReset = () => {
    setSelectedMood(null);
  };

  return (
    <main className="min-h-screen relative overflow-hidden py-32 px-6 flex flex-col items-center">
      {/* Back button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-klee text-lg">Back to Earth</span>
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!selectedMood ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 mb-6 backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">A Message Awaits</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-oleo text-white mb-6 drop-shadow-lg">Letters from the Stars</h1>
                <p className="text-xl text-white/60 font-klee">How is your heart feeling today, traveler?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoodSelect(mood.id)}
                      className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                    >
                      <Icon className={`w-8 h-8 ${mood.color}`} />
                      <span className="font-oleo text-xl text-white tracking-wide">{mood.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative">
                {/* Glowing orb behind text */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                {isGenerating && !completion && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    <p className="text-white/50 font-klee animate-pulse">Receiving transmission across lightyears...</p>
                  </div>
                )}
                
                {(completion || error) && (
                  <div className="relative z-10">
                    <div className="mb-10 text-white/40 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span className="font-klee uppercase tracking-widest text-xs">Incoming Message</span>
                    </div>
                    
                    <p className="text-xl md:text-2xl leading-loose font-klee text-white/90 whitespace-pre-wrap">
                      {completion}
                    </p>
                    
                    {isGenerating && completion && (
                      <span className="inline-block w-2 h-6 bg-white/50 ml-1 animate-pulse align-middle" />
                    )}
                    
                    {!isGenerating && !error && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center text-center gap-4"
                      >
                        <p className="text-white/50 font-klee italic">— The Universe</p>
                        <button 
                          onClick={handleReset}
                          className="mt-4 px-6 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-klee"
                        >
                          Send another thought
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
