'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '@/lib/firebase/services/galleryService';
import { GalleryItem } from '@/types';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function ObservatoryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await galleryService.getAllGalleryItems();
        // Filter out if you want only featured: data.filter(item => item.featuredInObservatory)
        // Or just show all if no specific filter is needed. Let's show all for now, maybe prioritize featured.
        setItems(data);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 px-4 sm:px-6">
      {/* Soft gradients and depth layers */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-oleo text-foreground mb-6">The Observatory</h1>
          <p className="text-muted-foreground font-klee text-lg md:text-xl max-w-2xl mx-auto">
            A curated gallery of visions, moments, and starry-eyed wonders.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                layout
                layoutId={`card-${item.id}`}
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setSelectedId(item.id)}
              >
                {/* Glassmorphic Frame */}
                <div className="bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-lg p-2 transition-colors hover:bg-white/10 dark:hover:bg-black/60">
                  <div className="relative rounded-xl overflow-hidden">
                    {/* Using standard img for masonry to get natural heights, Next Image could be used with specific layout if aspect ratios were known */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div>
                        <h3 className="text-white font-oleo text-2xl mb-1">{item.title}</h3>
                        <p className="text-white/80 font-klee text-sm line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Viewer Modal */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedId(null)}
          >
            <motion.button
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(null);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              layoutId={`card-${selectedItem.id}`}
              className="relative w-full max-w-5xl max-h-full bg-black/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 bg-black/40 min-h-[40vh] md:min-h-[70vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="w-full md:w-80 lg:w-96 p-8 bg-white/5 backdrop-blur-md flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-oleo text-white mb-4"
                >
                  {selectedItem.title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/70 font-klee text-lg leading-relaxed"
                >
                  {selectedItem.description}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
