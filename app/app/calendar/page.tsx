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

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const nextMonth = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
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

  // Week days calculation
  const currentWeekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      return {
        date: d,
        iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
      };
    });
  }, [currentDate]);

  // Agenda list (all upcoming items ordered by date)
  const allAgendaItems = useMemo(() => {
    const items: {
      date: string;
      type: 'task' | 'milestone';
      title: string;
      subtitle?: string;
      priority?: string;
      id: string;
      completed?: boolean;
    }[] = [];

    tasks.forEach((t) => {
      if (t.dueDate) {
        items.push({
          date: t.dueDate,
          type: 'task',
          title: t.title,
          priority: t.priority,
          id: t.id,
          completed: t.status === 'completed',
        });
      }
    });

    projects.forEach((p) => {
      p.milestones.forEach((m) => {
        if (m.targetDate) {
          items.push({
            date: m.targetDate,
            type: 'milestone',
            title: m.title,
            subtitle: p.name,
            id: m.id,
            completed: m.completed,
          });
        }
      });
    });

    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, projects]);

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

        <div className="flex items-center flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={jumpToToday} className="text-xs">
            Today
          </Button>

          {viewMode !== 'agenda' && (
            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2.5 text-slate-800">{monthName}</span>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upcoming Deliverables & Deadlines ({allAgendaItems.length})
            </h2>
          </div>

          {allAgendaItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No scheduled deadlines or milestones. Set a due date on any task or project to populate the agenda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allAgendaItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {formatDate(item.date)}
                    </span>
                    <div>
                      <p className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.type === 'milestone' ? '🚩 ' : ''}{item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.priority && <PriorityBadge priority={item.priority as any} />}
                    {item.type === 'task' && (
                      <Link
                        href={`/app/focus?taskId=${item.id}`}
                        className="text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        Focus →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {currentWeekDays.map((wd) => {
              const dayData = dateEventsMap.get(wd.iso);
              const isToday = new Date().toISOString().split('T')[0] === wd.iso;
              const isSelected = selectedDateStr === wd.iso;

              return (
                <div
                  key={wd.iso}
                  onClick={() => setSelectedDateStr(wd.iso)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all min-h-[140px] flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 bg-white'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{wd.dayName}</span>
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                            : 'text-slate-800'
                        }`}
                      >
                        {wd.dayNum}
                      </span>
                    </div>

                    <div className="space-y-1 mt-2">
                      {dayData?.milestones.map((m, idx) => (
                        <div
                          key={`wm-${idx}`}
                          className="text-[9px] font-semibold bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded truncate"
                        >
                          🚩 {m.name}
                        </div>
                      ))}
                      {dayData?.tasks.map((t) => (
                        <div
                          key={`wt-${t.id}`}
                          className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                            t.status === 'completed'
                              ? 'line-through text-slate-400 bg-slate-100'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 pt-2">
                    {(dayData?.tasks.length || 0) + (dayData?.milestones.length || 0)} items
                  </span>
                </div>
              );
            })}
          </div>

          {/* Agenda for selected day below week view */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected: {formatDate(selectedDateStr)}
            </h3>
            {selectedEvents.tasks.length === 0 && selectedEvents.milestones.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No deliverables due on this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.milestones.map((m, idx) => (
                  <div key={idx} className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                    🚩 {m.name} ({m.projName})
                  </div>
                ))}
                {selectedEvents.tasks.map((task) => (
                  <div key={task.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                    <span className={task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                      {task.title}
                    </span>
                    <Link href={`/app/focus?taskId=${task.id}`} className="text-indigo-600 font-semibold hover:underline text-[11px]">
                      Focus →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MONTH VIEW (DEFAULT) */}
      {viewMode === 'month' && (
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
      )}
    </div>
  );
}
