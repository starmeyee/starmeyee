"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { musicService } from "@/lib/firebase/services/musicService";
import type { MusicItem } from "@/types";
import { Play } from "lucide-react";

interface MusicPreviewSectionProps {
  content: Record<string, any>;
}

export default function MusicPreviewSection({ content }: MusicPreviewSectionProps) {
  const { title, description } = content;
  const [musicItems, setMusicItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMusic() {
      try {
        const items = await musicService.getAllMusicItems();
        setMusicItems(items.filter((item) => item.featured).slice(0, 4));
      } catch (error) {
        console.error("Error fetching music:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMusic();
  }, []);

  if (loading || musicItems.length === 0) return null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            {title || "Soundscapes"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description || "Melodies that accompany the thoughts."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {musicItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 dark:bg-black/40 rounded-2xl overflow-hidden hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <div className="aspect-square w-full relative overflow-hidden">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.songTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <a
                  href={item.spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </a>
              </div>
              
              <div className="p-5 text-center">
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white truncate">
                  {item.songTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                  {item.artist}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
