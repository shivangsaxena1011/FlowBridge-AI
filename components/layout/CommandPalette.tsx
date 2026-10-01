'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckSquare,
  FolderKanban,
  Flame,
  Plus,
  ArrowRight,
  Inbox,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Modal } from '@/ui/modal';
import { useFlowBridgeStore } from '@/lib/data/store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickCapture: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenQuickCapture }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { tasks, projects } = useFlowBridgeStore();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  // Compile all actionable items into a single flat list for smooth arrow key navigation
  const paletteItems = useMemo(() => {
    const q = query.toLowerCase().trim();

    const quickActions = [
      {
        id: 'qa-capture',
        category: 'Quick Actions',
        title: 'Capture something (Note, Voice, Image)',
        icon: Plus,
        iconColor: 'bg-indigo-50 text-indigo-600',
        shortcut: 'C',
        action: () => {
          onClose();
          onOpenQuickCapture();
        },
      },
      {
        id: 'qa-focus',
        category: 'Quick Actions',
        title: 'Start priority focus session',
        icon: Flame,
        iconColor: 'bg-rose-50 text-rose-600',
        action: () => handleNavigate('/app/focus'),
      },
      {
        id: 'qa-today',
        category: 'Quick Actions',
        title: 'Open Today: Plan my day',
        icon: CheckSquare,
        iconColor: 'bg-emerald-50 text-emerald-600',
        action: () => handleNavigate('/app/today'),
      },
    ];

    const pages = [
      { id: 'page-inbox', category: 'Navigation', title: 'Smart Inbox', icon: Inbox, action: () => handleNavigate('/app/inbox') },
      { id: 'page-tasks', category: 'Navigation', title: 'Task Directory', icon: CheckSquare, action: () => handleNavigate('/app/tasks') },
      { id: 'page-projects', category: 'Navigation', title: 'Project Portfolios', icon: FolderKanban, action: () => handleNavigate('/app/projects') },
      { id: 'page-calendar', category: 'Navigation', title: 'Execution Calendar', icon: Calendar, action: () => handleNavigate('/app/calendar') },
      { id: 'page-insights', category: 'Navigation', title: 'Productivity Insights', icon: BarChart3, action: () => handleNavigate('/app/insights') },
      { id: 'page-settings', category: 'Navigation', title: 'System Settings', icon: Settings, action: () => handleNavigate('/app/settings') },
    ];

    const taskItems = tasks
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `task-${t.id}`,
        category: 'Tasks',
        title: t.title,
        subtitle: `${t.priority} priority • ~${t.estimatedMinutes || 30}m`,
        icon: CheckSquare,
        action: () => handleNavigate(`/app/tasks`),
      }));

    const projectItems = projects
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({
        id: `project-${p.id}`,
        category: 'Projects',
        title: p.name,
        color: p.color,
        icon: FolderKanban,
        action: () => handleNavigate(`/app/projects`),
      }));

    const all = [...quickActions, ...pages, ...taskItems, ...projectItems];
    if (!q) return all;
    return all.filter((item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [query, tasks, projects]);

  // Handle keyboard events (Up, Down, Enter, Esc)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (paletteItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % paletteItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + paletteItems.length) % paletteItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = paletteItems[selectedIndex];
      if (current) {
        current.action();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-3" onKeyDown={handleKeyDown}>
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search tasks, or navigate (↑↓ Enter)..."
            autoFocus
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Actionable item list */}
        <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1 text-xs">
          {paletteItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching commands or resources found for &quot;{query}&quot;
            </div>
          ) : (
            paletteItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-950 font-medium border border-indigo-200/60'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${
                        (item as any).iconColor || 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-xs leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.category} {(item as any).subtitle ? `• ${(item as any).subtitle}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(item as any).shortcut && (
                      <kbd className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                        {(item as any).shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight className="h-3 w-3 text-indigo-600 animate-in fade-in" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
