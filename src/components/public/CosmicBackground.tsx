'use client';

import { motion } from 'framer-motion';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black selection:bg-purple-500/30">
      {/* Base deep space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a1a] via-black to-black" />

      {/* Layer 1: Aurora / Nebula glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen blur-[100px] opacity-40 bg-[radial-gradient(circle,_rgba(123,31,162,0.4)_0%,_rgba(0,0,0,0)_70%)]"
      />

      {/* Layer 2: Second nebula */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          rotate: [360, 180, 360]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen blur-[120px] opacity-30 bg-[radial-gradient(circle,_rgba(30,136,229,0.3)_0%,_rgba(0,0,0,0)_70%)]"
      />

      {/* Layer 3: Subtle accent glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-screen blur-[90px] opacity-20 bg-[radial-gradient(circle,_rgba(0,212,255,0.2)_0%,_rgba(0,0,0,0)_70%)]"
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
