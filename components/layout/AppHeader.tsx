'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/ui/button';

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenQuickCapture: () => void;
  onToggleMobileMenu: () => void;
  title?: string;
}

export function AppHeader({
  onOpenCommandPalette,
  onOpenQuickCapture,
  onToggleMobileMenu,
  title,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/app" className="md:hidden flex items-center gap-1.5 font-bold text-sm text-slate-900">
          <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>FlowBridge</span>
        </Link>

        {title && (
          <h1 className="hidden md:block text-sm font-semibold text-slate-800">
            {title}
          </h1>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search or command...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-flex text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* AI Ready Indicator Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[11px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Engine Ready</span>
        </div>

        {/* Quick Capture Button */}
        <Button size="sm" onClick={onOpenQuickCapture} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Capture</span>
        </Button>
      </div>
    </header>
  );
}
