'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { QuickCaptureModal } from '@/components/layout/QuickCaptureModal';
import { initStorageIfEmpty } from '@/lib/data/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    initStorageIfEmpty();

    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // 'c' or 'C' when not focusing on input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInput && (e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <AppSidebar onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-20 md:pb-6">
        <AppHeader
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        isOpenDrawer={isMobileDrawerOpen}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
      />
    </div>
  );
}
