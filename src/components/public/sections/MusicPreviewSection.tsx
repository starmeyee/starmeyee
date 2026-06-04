"use client";

import { motion } from "framer-motion";
import { Play, Music } from "lucide-react";

interface MusicPreviewSectionProps {
  content?: Record<string, any>;
}

export default function MusicPreviewSection({ content }: MusicPreviewSectionProps) {
  const playlist = [
    {
      title: "Suzume",
      artist: "RADWIMPS",
      image: "https://i.scdn.co/image/ab67616d0000b27376c6691dc57c2cba450bd8ee",
      color: "from-blue-500/20",
    },
    {
      title: "Shinunoga E-Wa",
      artist: "Fujii Kaze",
      image: "https://i.scdn.co/image/ab67616d0000b273b060d40be44d9f1db71ec5d8",
      color: "from-orange-500/20",
    },
    {
      title: "Idol",
      artist: "YOASOBI",
      image: "https://i.scdn.co/image/ab67616d0000b27379201db4b86e88e2c0e86b05",
      color: "from-pink-500/20",
    },
    {
      title: "NIGHT DANCER",
      artist: "imase",
      image: "https://i.scdn.co/image/ab67616d0000b2733d98a0ae7c78a3a9babaf8af",
      color: "from-purple-500/20",
    },
    {
      title: "Suki Dakara",
      artist: "Yuika",
      image: "https://i.scdn.co/image/ab67616d0000b273b751dc3e8d7d457635293291",
      color: "from-yellow-500/20",
    },
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Music className="w-5 h-5" />
              <span className="font-medium tracking-wide uppercase text-sm">Soundtrack of My Universe</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-oleo text-white mb-4">Current Vibrations</h2>
            <p className="text-white/70 font-klee text-xl max-w-xl">
              The melodies that fuel my imagination and score my stargazing sessions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {playlist.map((song, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={song.image}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${song.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="text-white font-medium text-lg truncate group-hover:text-indigo-300 transition-colors">{song.title}</h3>
              <p className="text-white/60 text-sm truncate">{song.artist}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
