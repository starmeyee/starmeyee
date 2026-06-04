"use client";

import { motion } from "framer-motion";

interface ThingsILoveSectionProps {
  content: Record<string, any>;
}

export default function ThingsILoveSection({ content }: ThingsILoveSectionProps) {
  const { title, items } = content;
  // Fallback items if none provided
  const fallbackItems = [
    { title: "Astronomy", description: "Stargazing and pondering the vastness of the universe.", icon: "🔭" },
    { title: "Japan", description: "The culture, the aesthetics, and the timeless philosophy.", icon: "🎌" },
    { title: "Philosophy", description: "Deep dives into stoicism and existentialism.", icon: "📚" }
  ];

  const displayItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems;

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            {title || "Things I Love"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Curiosities and passions that fuel the journey.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayItems.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 dark:bg-black/40 rounded-3xl p-8 hover:bg-white/10 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">
                {item.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
