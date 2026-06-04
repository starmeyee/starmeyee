"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Maximize2 } from "lucide-react";

interface GalleryPreviewSectionProps {
  content?: Record<string, any>;
}

export default function GalleryPreviewSection({ content }: GalleryPreviewSectionProps) {
  const images = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop",
      title: "Nebular Dust",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2000&auto=format&fit=crop",
      title: "Milky Way Core",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop",
      title: "Deep Field",
      span: "md:col-span-1 md:row-span-1",
    },
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-oleo text-white mb-4">The Observatory</h2>
            <p className="text-white/70 font-klee text-xl max-w-xl">
              Glimpses of the cosmos through my lens. A curated collection of starry-eyed wonders.
            </p>
          </div>
          <Link
            href="/observatory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-medium shrink-0 backdrop-blur-md"
          >
            Enter Observatory
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className={`group relative rounded-3xl overflow-hidden ${img.span} min-h-[300px] md:min-h-0 bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer shadow-lg`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-oleo text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.title}</h3>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
