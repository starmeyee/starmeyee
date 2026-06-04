"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2 } from "lucide-react";

interface BeautifulResponse {
  image: string;
  title: string;
  reflection: string;
  quote: string;
  author: string;
}

export default function SomethingBeautifulButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BeautifulResponse | null>(null);

  const handleDiscover = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/beautiful");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Slight delay to keep the exit animation smooth before resetting data
    setTimeout(() => setData(null), 300);
  };

  return (
    <>
      <button
        onClick={handleDiscover}
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <Sparkles className="w-5 h-5 text-indigo-300 group-hover:animate-pulse" />
        <span className="font-oleo text-xl text-white tracking-wide">Show Me Something Beautiful</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-[#030308]/90 backdrop-blur-xl"
            onClick={handleClose}
          >
            <motion.button
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 backdrop-blur-md border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              layoutId="beautiful-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(123,31,162,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              {loading || !data ? (
                <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-white/60 font-klee text-lg animate-pulse">Searching the cosmos for something beautiful...</p>
                </div>
              ) : (
                <>
                  <div className="relative flex-1 bg-black/60 min-h-[40vh] md:min-h-[70vh] flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.image}
                      alt={data.title}
                      className="max-w-full max-h-[65vh] object-contain drop-shadow-2xl rounded-lg"
                    />
                  </div>
                  <div className="w-full md:w-[400px] p-8 md:p-12 bg-white/5 backdrop-blur-2xl flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative z-10"
                    >
                      <h2 className="text-3xl font-oleo text-white mb-6 leading-tight">{data.title}</h2>
                      
                      <div className="w-8 h-px bg-indigo-500/50 mb-6" />
                      
                      <p className="text-white/80 font-klee text-lg leading-relaxed mb-8">
                        {data.reflection}
                      </p>
                      
                      <blockquote className="border-l-2 border-indigo-500/30 pl-4 py-2 mt-auto">
                        <p className="text-white/60 font-klee italic text-base mb-2">"{data.quote}"</p>
                        <footer className="text-white/40 font-sans text-sm tracking-widest uppercase">— {data.author}</footer>
                      </blockquote>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
