'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { settingsService } from '@/lib/firebase/services/settingsService';
import type { SiteSettings } from '@/types';

const links = [
  { href: '/', label: 'Home' },
  { href: '/writes', label: 'Library' },
  { href: '/about', label: 'About' },
  { href: '/observatory', label: 'Observatory' },
];

export default function Navbar() {
  const [siteName, setSiteName] = useState<string>('StarMeyee');
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await settingsService.getSettings();
        if (settings?.siteName) {
          setSiteName(settings.siteName);
        }
      } catch (error) {
        console.error('Failed to fetch site settings', error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 flex justify-center">
      <nav className="flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400"
          />
          <span className="font-display font-medium text-lg tracking-wide text-white/90 group-hover:text-white transition-colors">
            {siteName}
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <MagneticLink key={link.href} href={link.href} isActive={isActive}>
                {link.label}
              </MagneticLink>
            );
          })}
        </ul>

        {/* Mobile menu button could go here - keeping it simple for now */}
        <div className="md:hidden flex items-center">
          <button className="text-white/70 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}

function MagneticLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLLIElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLLIElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.li
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative"
    >
      <Link
        href={href}
        className={`relative px-4 py-2 block text-sm transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="navbar-active-indicator"
            className="absolute inset-0 bg-white/10 rounded-full z-[-1]"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    </motion.li>
  );
}
