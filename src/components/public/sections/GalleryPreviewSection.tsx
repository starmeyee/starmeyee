"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { galleryService } from "@/lib/firebase/services/galleryService";
import type { GalleryItem } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GalleryPreviewSectionProps {
  content: Record<string, any>;
}

export default function GalleryPreviewSection({ content }: GalleryPreviewSectionProps) {
  const { title, description } = content;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const allItems = await galleryService.getAllGalleryItems();
        setItems(allItems.filter((item) => item.featuredOnHomepage).slice(0, 6));
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
              {title || "The Observatory"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
              {description || "Glimpses into the cosmic visual journey."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href="/observatory"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative group rounded-2xl overflow-hidden ${
                idx === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className="aspect-square md:aspect-auto md:h-full w-full">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-display font-bold text-lg md:text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
