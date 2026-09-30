'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  FolderKanban,
  Flame,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { useFlowBridgeStore } from '@/lib/data/store';
import { formatDate } from '@/lib/utils';
import { Task, ProjectMilestone } from '@/types';

export default function CalendarPage() {
  const { tasks, projects, focusSessions } = useFlowBridgeStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar grid calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map dates to events
  const dateEventsMap = useMemo(() => {
    const map = new Map<string, { tasks: Task[]; milestones: { name: string; projName: string }[] }>();

    tasks.forEach((t) => {
      if (t.dueDate) {
        const list = map.get(t.dueDate) || { tasks: [], milestones: [] };
        list.tasks.push(t);
        map.set(t.dueDate, list);
      }
    });

    projects.forEach((p) => {
      p.milestones.forEach((m) => {
        if (m.targetDate) {
          const list = map.get(m.targetDate) || { tasks: [], milestones: [] };
          list.milestones.push({ name: m.title, projName: p.name });
          map.set(m.targetDate, list);
        }
      });
    });

    return map;
  }, [tasks, projects]);

  const selectedEvents = dateEventsMap.get(selectedDateStr) || { tasks: [], milestones: [] };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Execution Schedule</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual calendar mapping deadlines, project milestones, and historical focus sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={jumpToToday} className="text-xs">
            Today
          </Button>
          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg"
              title="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold px-2.5 text-slate-800">{monthName}</span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg"
              title="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {/* Empty leading padding */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] p-1.5 bg-slate-50/40 rounded-lg" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day
                  .toString()
                  .padStart(2, '0')}`;
                const isSelected = selectedDateStr === dStr;
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = todayStr === dStr;
                const dayData = dateEventsMap.get(dStr);

                return (
                  <div
                    key={dStr}
                    onClick={() => setSelectedDateStr(dStr)}
                    className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : isToday
                        ? 'border-indigo-300 bg-white'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isToday
                            ? 'h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                            : 'text-slate-800'
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Small badges for items */}
                    <div className="space-y-0.5 mt-1 overflow-hidden">
                      {dayData?.milestones.map((m, idx) => (
                        <div
                          key={`m-${idx}`}
                          className="text-[9px] font-semibold bg-emerald-100/80 text-emerald-800 px-1 py-0.2 rounded truncate"
                        >
                          🚩 {m.name}
                        </div>
                      ))}
                      {dayData?.tasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[9px] px-1 py-0.2 rounded truncate font-medium ${
                            t.status === 'completed'
                              ? 'line-through text-slate-400 bg-slate-100'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayData && dayData.tasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-medium">
                          +{dayData.tasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Detail Drawer / Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agenda for {formatDate(selectedDateStr)}
            </h2>
          </div>

          <Card className="p-4 space-y-4">
            {/* Milestones on this date */}
            {selectedEvents.milestones.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                  Project Milestones
                </p>
                {selectedEvents.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs"
                  >
                    <p className="font-semibold text-emerald-900">🚩 {m.name}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">{m.projName}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks scheduled on this date */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Scheduled Tasks ({selectedEvents.tasks.length})
              </p>

              {selectedEvents.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No deliverables due on this date.
                </p>
              ) : (
                selectedEvents.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-semibold ${
                          task.status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>~{task.estimatedMinutes || 30} mins</span>
                      <Link
                        href={`/app/focus?taskId=${task.id}`}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Focus now →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
