'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  CalendarCheck2,
  MoreHorizontal,
  Plus,
  CheckSquare,
  FolderKanban,
  Calendar,
  Flame,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowBridgeStore } from '@/lib/data/store';
import { isTodayDate } from '@/lib/utils';

interface MobileNavProps {
  onOpenQuickCapture: () => void;
  isOpenDrawer: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

export function MobileNav({ onOpenQuickCapture, isOpenDrawer, onOpenDrawer, onCloseDrawer }: MobileNavProps) {
  const pathname = usePathname();
  const { tasks, inboxItems } = useFlowBridgeStore();

  const pendingInbox = inboxItems.filter((i) => i.status === 'pending' || i.status === 'processed').length;
  const todayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isTodayDate(t.dueDate)
  ).length;

  return (
    <>
      {/* Slide-over Drawer for All Links */}
      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseDrawer}
          />
          <div className="relative bg-white rounded-t-2xl p-5 border-t border-slate-200 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-sm text-slate-900">Workspace Navigation</span>
              <button onClick={onCloseDrawer} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/app/tasks"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                <span>Tasks</span>
              </Link>

              <Link
                href="/app/projects"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <FolderKanban className="h-4 w-4 text-emerald-600" />
                <span>Projects</span>
              </Link>

              <Link
                href="/app/focus"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Focus Mode</span>
              </Link>

              <Link
                href="/app/calendar"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <Calendar className="h-4 w-4 text-sky-500" />
                <span>Calendar</span>
              </Link>

              <Link
                href="/app/insights"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span>Insights</span>
              </Link>

              <Link
                href="/app/settings"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 font-medium text-slate-800 hover:bg-slate-100"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 flex items-center justify-around px-2 py-1.5 h-16 safe-area-bottom">
        <Link
          href="/app"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
            pathname === '/app' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/app/inbox"
          className={cn(
            'relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
            pathname.startsWith('/app/inbox') ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Inbox className="h-4.5 w-4.5" />
          <span>Inbox</span>
          {pendingInbox > 0 && (
            <span className="absolute top-0 right-3 h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingInbox}
            </span>
          )}
        </Link>

        {/* Floating Center Capture Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickCapture}
            className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            aria-label="Quick capture"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <Link
          href="/app/today"
          className={cn(
            'relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
            pathname.startsWith('/app/today') ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <CalendarCheck2 className="h-4.5 w-4.5" />
          <span>Today</span>
          {todayTasks > 0 && (
            <span className="absolute top-0 right-3 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {todayTasks}
            </span>
          )}
        </Link>

        <button
          onClick={onOpenDrawer}
          data-drawer-trigger="true"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer'
          )}
        >
          <MoreHorizontal className="h-4.5 w-4.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
