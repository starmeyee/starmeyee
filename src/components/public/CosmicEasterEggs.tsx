"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StarBurst {
  id: number;
  x: number;
  y: number;
}

export default function CosmicEasterEggs() {
  const [bursts, setBursts] = useState<StarBurst[]>([]);
  const [shootingStar, setShootingStar] = useState(false);

  useEffect(() => {
    // 1. Double click to spawn a star burst
    const handleDoubleClick = (e: MouseEvent) => {
      // Don't interfere with links or buttons
      if ((e.target as HTMLElement).closest('a, button, input')) return;
      
      const newBurst = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      
      setBursts(prev => [...prev, newBurst]);
      
      // Remove it after animation
      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== newBurst.id));
      }, 2000);
    };

    window.addEventListener("dblclick", handleDoubleClick);

    // 2. Secret konami-code-style sequence for "star"
    let keySequence = "";
    const targetSequence = "star";

    const handleKeyDown = (e: KeyboardEvent) => {
      keySequence += e.key.toLowerCase();
      if (keySequence.length > targetSequence.length) {
        keySequence = keySequence.slice(keySequence.length - targetSequence.length);
      }
      
      if (keySequence === targetSequence && !shootingStar) {
        setShootingStar(true);
        setTimeout(() => setShootingStar(false), 3000); // Reset after animation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shootingStar]);

  return (
    <>
      <AnimatePresence>
        {bursts.map(burst => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, scale: 0, rotate: -45 }}
            animate={{ opacity: 0, scale: 2, rotate: 45, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="fixed z-50 pointer-events-none text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: burst.x, top: burst.y, transform: "translate(-50%, -50%)" }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {shootingStar && (
          <motion.div
            initial={{ x: "120vw", y: "-20vh", opacity: 1 }}
            animate={{ x: "-20vw", y: "120vh", opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="fixed z-[100] pointer-events-none w-[300px] h-1 bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45 blur-[1px]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
