import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import CosmicBackground from '@/components/public/CosmicBackground';

export const revalidate = 60; // Cache and revalidate public pages every 60 seconds

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="relative flex min-h-[100dvh] flex-col text-white">
      <CosmicBackground />
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
