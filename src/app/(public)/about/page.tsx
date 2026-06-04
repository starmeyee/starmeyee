'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aboutService } from '@/lib/firebase/services/aboutService';
import { AboutSection } from '@/types';
import { Loader2 } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
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

export default function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await aboutService.getAboutContent();
        
        // Order sections appropriately based on standard flow
        const order = ['who_am_i', 'things_i_wonder', 'things_i_love', 'current_mission', 'long_form_story'];
        const sorted = data.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
        
        setSections(sorted);
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24">
      {/* Background ambient cosmic glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-oleo text-foreground mb-6">About Me</h1>
          <p className="text-muted-foreground font-klee text-lg md:text-xl max-w-2xl mx-auto">
            A glimpse into my universe. The thoughts, the wonder, and the mission.
          </p>
        </motion.div>

        <div className="space-y-24">
          {sections.map((section, index) => {
            if (!section.content) return null; // Skip empty sections

            return (
              <motion.section
                key={section.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className="relative"
              >
                {/* Glassmorphic Container */}
                <div className="bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_-15px_rgba(33,28,132,0.3)]">
                  <h2 className="text-3xl md:text-4xl font-oleo text-brand-primary dark:text-brand-soft mb-8">
                    {section.label}
                  </h2>
                  <div 
                    className="prose prose-lg dark:prose-invert font-klee text-foreground/90 max-w-none prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>

                {/* Cosmic Divider for all but the last item */}
                {index !== sections.length - 1 && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-brand-primary/50 to-transparent" />
                )}
              </motion.section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
