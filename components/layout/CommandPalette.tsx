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
  const { tasks, projects } = useFlowBridgeStore();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredTasks = useMemo(() => {
    if (!query) return tasks.slice(0, 4);
    const q = query.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5);
  }, [tasks, query]);

  const filteredProjects = useMemo(() => {
    if (!query) return projects.slice(0, 3);
    const q = query.toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 3);
  }, [projects, query]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search tasks, or open projects..."
            autoFocus
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenQuickCapture();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-slate-900">Capture new thought or note</span>
                </div>
                <kbd className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                  C
                </kbd>
              </button>

              <button
                onClick={() => handleNavigate('/app/focus')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-slate-900">Start next priority focus session</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigate('/app/tasks')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider ml-2 shrink-0">
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                Projects
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleNavigate('/app/projects')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color || '#6366f1' }}
                      />
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Pages
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleNavigate('/app/inbox')}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              >
                <Inbox className="h-3.5 w-3.5 text-slate-400" />
                <span>Inbox</span>
              </button>
              <button
                onClick={() => handleNavigate('/app/calendar')}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => handleNavigate('/app/insights')}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              >
                <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                <span>Insights</span>
              </button>
              <button
                onClick={() => handleNavigate('/app/settings')}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
