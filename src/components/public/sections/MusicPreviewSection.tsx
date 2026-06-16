"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Music } from "lucide-react";
import { musicService } from "@/lib/firebase/services/musicService";
import type { MusicItem } from "@/types";

interface MusicPreviewSectionProps {
  content?: Record<string, unknown>;
}

interface DisplaySong {
  id: string;
  title: string;
  artist: string;
  image: string | null;
  spotifyLink: string;
  color: string;
}

const GRADIENTS = [
  "from-blue-500/20",
  "from-orange-500/20",
  "from-pink-500/20",
  "from-purple-500/20",
  "from-yellow-500/20",
];

// Shown only when the admin hasn't added any songs yet. Links point to Spotify
// search so they always resolve to a valid destination.
const FALLBACK_SONGS: DisplaySong[] = [
  { id: "fb-1", title: "Suzume", artist: "RADWIMPS", image: null, spotifyLink: "https://open.spotify.com/search/Suzume%20RADWIMPS", color: GRADIENTS[0] },
  { id: "fb-2", title: "Shinunoga E-Wa", artist: "Fujii Kaze", image: null, spotifyLink: "https://open.spotify.com/search/Shinunoga%20E-Wa%20Fujii%20Kaze", color: GRADIENTS[1] },
  { id: "fb-3", title: "Idol", artist: "YOASOBI", image: null, spotifyLink: "https://open.spotify.com/search/Idol%20YOASOBI", color: GRADIENTS[2] },
  { id: "fb-4", title: "NIGHT DANCER", artist: "imase", image: null, spotifyLink: "https://open.spotify.com/search/NIGHT%20DANCER%20imase", color: GRADIENTS[3] },
  { id: "fb-5", title: "Suki Dakara", artist: "Yuika", image: null, spotifyLink: "https://open.spotify.com/search/Suki%20Dakara%20Yuika", color: GRADIENTS[4] },
];

function SongCard({ song, index }: { song: DisplaySong; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = song.image && !imageFailed;
  const hasLink = Boolean(song.spotifyLink);

  const card = (
    <>
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg bg-white/5 border border-white/10">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.image as string}
            alt={song.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
            <Music className="w-10 h-10 text-white/40" />
          </div>
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${song.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        {hasLink && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 text-white ml-1" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-white font-medium text-lg truncate group-hover:text-indigo-300 transition-colors">{song.title}</h3>
      <p className="text-white/60 text-sm truncate">{song.artist}</p>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`group ${hasLink ? "cursor-pointer" : ""}`}
    >
      {hasLink ? (
        <a href={song.spotifyLink} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title} by ${song.artist} on Spotify`}>
          {card}
        </a>
      ) : (
        card
      )}
    </motion.div>
  );
}

export default function MusicPreviewSection({ content }: MusicPreviewSectionProps) {
  const title = (content?.title as string) || "Current Vibrations";
  const subtitle = (content?.subtitle as string) || "The melodies that fuel my imagination and score my stargazing sessions.";

  const [songs, setSongs] = useState<DisplaySong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMusic() {
      try {
        const items = await musicService.getAllMusicItems();
        if (items.length > 0) {
          const mapped = sortSongs(items).slice(0, 10).map((item, idx) => ({
            id: item.id,
            title: item.songTitle,
            artist: item.artist,
            image: item.coverImage,
            spotifyLink: item.spotifyLink || "",
            color: GRADIENTS[idx % GRADIENTS.length],
          }));
          setSongs(mapped);
        } else {
          setSongs(FALLBACK_SONGS);
        }
      } catch (error) {
        console.error("Error fetching music items:", error);
        setSongs(FALLBACK_SONGS);
      } finally {
        setLoading(false);
      }
    }
    fetchMusic();
  }, []);

  if (loading || songs.length === 0) return null;

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Music className="w-5 h-5" />
              <span className="font-medium tracking-wide uppercase text-sm">Soundtrack of My Universe</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-oleo text-white mb-4">{title}</h2>
            <p className="text-white/70 font-klee text-xl max-w-xl">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {songs.map((song, idx) => (
            <SongCard key={song.id} song={song} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured songs first, then by display order (service already sorts by
// displayOrder, so this is a stable refinement).
function sortSongs(items: MusicItem[]): MusicItem[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  });
}
