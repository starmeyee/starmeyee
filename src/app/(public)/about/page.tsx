'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aboutService } from '@/lib/firebase/services/aboutService';
import { AboutSection } from '@/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

const DEFAULT_SECTIONS = [
  {
    id: 'who_am_i_fallback',
    key: 'who_am_i',
    label: 'Curious Mind',
    content: '<p>A dreamer navigating the infinite expanse of both the cosmos and the human imagination. I am deeply fascinated by the hidden mechanics of the universe, the quiet beauty of traditional philosophies, and the boundless possibilities of science fiction. Every star in the sky represents a question waiting to be asked.</p>',
  },
  {
    id: 'things_i_wonder_fallback',
    key: 'things_i_wonder',
    label: 'Things I Wonder About',
    content: '<p>I often find myself looking up at the night sky, pondering the sheer scale of existence. Are we truly alone in this grand architecture? How do the teachings of ancient philosophies align with modern cosmic discoveries? I wonder about the intersection of human consciousness and the vast emptiness of space.</p>',
  },
  {
    id: 'things_i_love_fallback',
    key: 'things_i_love',
    label: 'Things I Love',
    content: '<p>I am deeply inspired by the quiet aesthetics of Japanese culture—the concept of wabi-sabi, finding beauty in imperfection and impermanence. I love the thrill of discovering new celestial bodies, the evocative melodies of J-Pop, and the immersive worlds built by brilliant science fiction authors.</p>',
  },
  {
    id: 'current_mission_fallback',
    key: 'current_mission',
    label: 'Current Journey',
    content: '<p>Right now, I am focused on bridging the gap between scientific curiosity and creative storytelling. I want to build worlds, write stories, and capture moments that make people pause, look up, and realize just how wondrous it is to exist right here, right now.</p>',
  },
];

export default function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await aboutService.getAboutContent();
        
        // Filter out empty sections
        const validData = data.filter(s => s.content && s.content.trim() !== '');

        if (validData.length > 0) {
          const order = ['who_am_i', 'things_i_wonder', 'things_i_love', 'current_mission', 'long_form_story'];
          const sorted = validData.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
          setSections(sorted);
        } else {
          // If no content in CMS, use the elegant storytelling fallbacks
          setSections(DEFAULT_SECTIONS as AboutSection[]);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        setSections(DEFAULT_SECTIONS as AboutSection[]);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden py-32">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/profile.jpeg" 
                alt="StarMeyee" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-oleo text-white mb-6 drop-shadow-lg">About Me</h1>
          <p className="text-white/70 font-klee text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A glimpse into my universe. The thoughts, the wonder, and the mission.
          </p>
        </motion.div>

        <div className="space-y-16">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="relative"
            >
              {/* Pure Glassmorphic Container without harsh borders */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors duration-500 group">
                <h2 className="text-3xl md:text-4xl font-oleo text-white/90 mb-6 group-hover:text-white transition-colors">
                  {section.label}
                </h2>
                <div 
                  className="prose prose-lg prose-invert font-klee text-white/70 max-w-none prose-p:leading-relaxed prose-a:text-indigo-400 hover:prose-a:text-indigo-300"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
