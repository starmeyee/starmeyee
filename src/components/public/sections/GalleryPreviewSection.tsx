"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Maximize2 } from "lucide-react";
import { galleryService } from "@/lib/firebase/services/galleryService";

interface GalleryPreviewSectionProps {
  content?: Record<string, unknown>;
}

interface PreviewImage {
  id: string;
  url: string;
  title: string;
  span: string;
}

const SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
];

// Used only when the admin hasn't marked any gallery images as "Home Feature".
const FALLBACK_IMAGES: PreviewImage[] = [
  { id: "1", url: "/observatory/obs-8.jpeg", title: "Starry Memory", span: SPANS[0] },
  { id: "2", url: "/observatory/obs-2.jpeg", title: "Silent Night", span: SPANS[1] },
  { id: "3", url: "/observatory/obs-5.jpeg", title: "Distant Lights", span: SPANS[2] },
];

export default function GalleryPreviewSection({ content }: GalleryPreviewSectionProps) {
  const title = (content?.title as string) || "The Observatory";
  const subtitle =
    (content?.subtitle as string) ||
    (content?.description as string) ||
    "Glimpses of the cosmos through my lens. A curated collection of starry-eyed wonders.";

  const [images, setImages] = useState<PreviewImage[]>([]);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const items = await galleryService.getAllGalleryItems();
        const featured = items.filter((i) => i.featuredOnHomepage).slice(0, 3);
        if (featured.length > 0) {
          setImages(
            featured.map((item, idx) => ({
              id: item.id,
              url: item.imageUrl,
              title: item.title,
              span: SPANS[idx] || SPANS[SPANS.length - 1],
            }))
          );
        } else {
          setImages(FALLBACK_IMAGES);
        }
      } catch (error) {
        console.error("Error fetching gallery preview:", error);
        setImages(FALLBACK_IMAGES);
      }
    }
    fetchGallery();
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-oleo text-white mb-4">{title}</h2>
            <p className="text-white/70 font-klee text-xl max-w-xl">{subtitle}</p>
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
