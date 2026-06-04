'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '@/types';
import { X } from 'lucide-react';

import SomethingBeautifulButton from './SomethingBeautifulButton';

interface ObservatoryClientProps {
  initialItems: GalleryItem[];
}

export default function ObservatoryClient({ initialItems }: ObservatoryClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fallbackItems: GalleryItem[] = Array.from({ length: 11 }).map((_, i) => ({
    id: `obs-${i + 1}`,
    imageUrl: `/observatory/obs-${i + 1}.jpeg`,
    title: `Cosmic Vision ${i + 1}`,
    description: `A moment captured in the cosmos.`,
    displayOrder: i,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const itemsToRender = initialItems.length > 0 ? initialItems : fallbackItems;

  return (
    <main className="min-h-screen relative overflow-hidden py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-7xl font-oleo text-white mb-6 drop-shadow-lg">The Observatory</h1>
          <p className="text-white/70 font-klee text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A curated gallery of visions, moments, and starry-eyed wonders.
          </p>
          <SomethingBeautifulButton />
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {itemsToRender.map((item) => (
                <motion.div
                  layout
                  layoutId={`card-${item.id}`}
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-colors hover:bg-white/10 p-2">
                    <div className="relative rounded-xl overflow-hidden bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <div>
                          <h3 className="text-white font-oleo text-2xl mb-2">{item.title}</h3>
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

      <AnimatePresence>
        {selectedId && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#030308]/90 backdrop-blur-xl"
            onClick={() => setSelectedId(null)}
          >
            <motion.button
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 backdrop-blur-md border border-white/10"
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
              className="relative w-full max-w-6xl max-h-[90vh] bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(123,31,162,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 bg-black/60 min-h-[40vh] md:min-h-[80vh] flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
                />
              </div>
              <div className="w-full md:w-96 p-10 bg-white/5 backdrop-blur-2xl flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10">
                <motion.h2 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-oleo text-white mb-6"
                >
                  {selectedItem.title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
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
