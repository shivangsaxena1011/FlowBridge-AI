'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  CalendarCheck2,
  CheckSquare,
  FolderKanban,
  Calendar as CalendarIcon,
  Flame,
  BarChart3,
  Settings,
  Plus,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowBridgeStore } from '@/lib/data/store';
import { isTodayDate } from '@/lib/utils';

interface AppSidebarProps {
  onOpenQuickCapture?: () => void;
}

export function AppSidebar({ onOpenQuickCapture }: AppSidebarProps) {
  const pathname = usePathname();
  const { tasks, inboxItems, preferences } = useFlowBridgeStore();

  const pendingInboxCount = inboxItems.filter((i) => i.status === 'pending' || i.status === 'processed').length;
  const todayTasksCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isTodayDate(t.dueDate)
  ).length;

  const navItems = [
    { label: 'Overview', href: '/app', icon: LayoutDashboard },
    { label: 'Inbox', href: '/app/inbox', icon: Inbox, badge: pendingInboxCount > 0 ? pendingInboxCount : undefined },
    { label: 'Today', href: '/app/today', icon: CalendarCheck2, badge: todayTasksCount > 0 ? todayTasksCount : undefined },
    { label: 'Tasks', href: '/app/tasks', icon: CheckSquare },
    { label: 'Projects', href: '/app/projects', icon: FolderKanban },
    { label: 'Calendar', href: '/app/calendar', icon: CalendarIcon },
    { label: 'Focus', href: '/app/focus', icon: Flame },
    { label: 'Insights', href: '/app/insights', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200/90 z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100">
        <Link href="/app" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-slate-900">FlowBridge</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Execution Engine</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onOpenQuickCapture}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20 transition-all cursor-pointer group active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>Quick Capture</span>
          <kbd className="ml-auto hidden xl:inline-block text-[10px] bg-indigo-500/40 text-indigo-100 px-1.5 py-0.5 rounded">
            C
          </kbd>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group',
                isActive
                  ? 'bg-slate-100/90 text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 text-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          href="/app/settings"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group',
            pathname === '/app/settings'
              ? 'bg-slate-100 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          <span>Settings</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg bg-slate-50/80 border border-slate-100">
          <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {preferences.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{preferences.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{preferences.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
