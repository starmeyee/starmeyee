"use client";

import { motion } from "framer-motion";
import { Telescope, BookOpen, Quote, Sparkles } from "lucide-react";

interface ThingsILoveSectionProps {
  content?: Record<string, any>;
}

export default function ThingsILoveSection({ content }: ThingsILoveSectionProps) {
  const cards = [
    {
      title: "Astronomy",
      description: "Exploring the cosmic frontier, nebulae, and the deep wonders of the night sky.",
      icon: <Telescope className="w-8 h-8" />,
      color: "from-blue-500/20 to-cyan-500/5",
      borderColor: "border-blue-500/20",
      glowColor: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
    },
    {
      title: "Philosophy",
      description: "Pondering the scale of existence and the quiet mechanics of human consciousness.",
      icon: <Quote className="w-8 h-8" />,
      color: "from-purple-500/20 to-fuchsia-500/5",
      borderColor: "border-purple-500/20",
      glowColor: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]",
    },
    {
      title: "Japanese Aesthetics",
      description: "Finding harmony in Wabi-Sabi, J-Pop melodies, and the beauty of imperfection.",
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-pink-500/20 to-rose-500/5",
      borderColor: "border-pink-500/20",
      glowColor: "group-hover:shadow-[0_0_40px_rgba(236,72,153,0.3)]",
    },
    {
      title: "Storytelling",
      description: "Building immersive sci-fi worlds and crafting narratives that make people look up.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-indigo-500/20 to-violet-500/5",
      borderColor: "border-indigo-500/20",
      glowColor: "group-hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]",
    },
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-oleo text-white mb-6">Things I Wonder About</h2>
          <p className="text-white/70 font-klee text-xl max-w-2xl mx-auto">
            The core elements that inspire my journey through this universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border ${card.borderColor} overflow-hidden transition-all duration-500 ${card.glowColor} hover:-translate-y-1`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                  {card.icon}
                </div>
                <h3 className="text-3xl font-oleo text-white mb-4">{card.title}</h3>
                <p className="text-white/70 font-klee text-lg leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
