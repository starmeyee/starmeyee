'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { settingsService } from '@/lib/firebase/services/settingsService';
import { socialService } from '@/lib/firebase/services/socialService';
import type { SiteSettings, SocialLink } from '@/types';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedSettings, fetchedSocials] = await Promise.all([
          settingsService.getSettings(),
          socialService.getAllSocialLinks(),
        ]);
        if (fetchedSettings) setSettings(fetchedSettings);
        if (fetchedSocials) {
          // Sort by display order and only show enabled ones
          const activeSocials = fetchedSocials
            .filter((s) => s.enabled)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setSocialLinks(activeSocials);
        }
      } catch (error) {
        console.error('Failed to fetch footer data', error);
      }
    }
    fetchData();
  }, []);

  const footerContent = settings?.footerContent || 'Exploring the cosmic depths of imagination.';
  const credits = settings?.credits || '© ' + new Date().getFullYear() + ' StarMeyee. All rights reserved.';

  return (
    <footer className="w-full mt-auto py-8 px-4 sm:px-6 flex justify-center z-10 relative">
      <div className="w-full max-w-5xl rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <span className="font-oleo text-2xl text-white">
              {settings?.siteName || 'StarMeyee'}
            </span>
          </div>
          <p className="text-base text-white/70 font-klee leading-relaxed">
            {footerContent}
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6">
          {socialLinks.length > 0 && (
            <ul className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-klee text-white/70 hover:text-white transition-colors duration-300 relative group"
                  >
                    {social.platform}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="text-xs text-white/40">
            {credits}
          </div>
        </div>
      </div>
    </footer>
  );
}
