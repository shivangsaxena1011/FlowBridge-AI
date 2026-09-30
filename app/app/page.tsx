'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  FolderKanban,
  Inbox,
  AlertCircle,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { PriorityBadge } from '@/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { useFlowBridgeStore } from '@/lib/data/store';
import { isTodayDate, isPastDate, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/ui/toast';
import { CaptureBox } from '@/components/inbox/CaptureBox';

export default function DashboardPage() {
  const { tasks, projects, focusSessions, activity, preferences, actions } = useFlowBridgeStore();
  const { success } = useToast();
  const [showInlineCapture, setShowInlineCapture] = useState(false);

  // Derive today's tasks
  const todayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isTodayDate(t.dueDate)
  );

  // Highest priority task
  const urgentOrHighTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && (t.priority === 'urgent' || t.priority === 'high')
  );
  const topFocusTask = todayTasks[0] || urgentOrHighTasks[0] || tasks.find((t) => t.status !== 'completed');

  // Overdue count
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isPastDate(t.dueDate)
  );

  // Focus time today
  const totalFocusMins = focusSessions.reduce((acc, s) => acc + (s.actualMinutesSpent || 0), 0);

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    actions.updateTaskStatus(taskId, nextStatus);
    if (nextStatus === 'completed') {
      success('Task Completed', 'Progress recorded in analytics.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {preferences.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's what deserves your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInlineCapture((prev) => !prev)}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>{showInlineCapture ? 'Close Capture' : 'Smart Capture'}</span>
          </Button>

          <Link href="/app/focus">
            <Button size="sm" className="gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>Start Focus</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Inline Smart Capture if toggled */}
      {showInlineCapture && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <CaptureBox onSuccess={() => setShowInlineCapture(false)} />
        </div>
      )}

      {/* Today's Top Priority Callout */}
      {topFocusTask && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 shadow-md shadow-indigo-900/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold border border-indigo-400/30">
                  <Sparkles className="h-3 w-3" />
                  Highest Leverage Work Today
                </span>
                <PriorityBadge priority={topFocusTask.priority} />
              </div>

              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                {topFocusTask.title}
              </h2>

              <p className="text-xs text-indigo-200 line-clamp-2">
                {topFocusTask.aiRationale ||
                  topFocusTask.description ||
                  'Identified by FlowBridge AI as your highest impact focus.'}
              </p>

              {topFocusTask.subtasks.length > 0 && (
                <div className="flex items-center gap-3 pt-1 text-xs text-indigo-300">
                  <span>
                    {topFocusTask.subtasks.filter((s) => s.completed).length} of{' '}
                    {topFocusTask.subtasks.length} steps completed
                  </span>
                  <span>•</span>
                  <span>~{topFocusTask.estimatedMinutes || 45} mins</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link href={`/app/focus?taskId=${topFocusTask.id}`}>
                <Button
                  size="md"
                  className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-xs border-0"
                >
                  <Flame className="h-4 w-4 text-indigo-600 mr-1.5" />
                  Enter Focus Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Tasks Due Today</p>
            <p className="text-2xl font-bold text-slate-900">{todayTasks.length}</p>
            {overdueTasks.length > 0 && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3" />
                {overdueTasks.length} overdue
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Deep Work Logged</p>
            <p className="text-2xl font-bold text-slate-900">{totalFocusMins}m</p>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              {focusSessions.filter((s) => s.completed).length} sessions completed
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Active Projects</p>
            <p className="text-2xl font-bold text-slate-900">
              {projects.filter((p) => p.status === 'active').length}
            </p>
            <p className="text-[11px] text-slate-400">Roadmaps on track</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FolderKanban className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Tasks Due Today + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks Due Today (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Tasks Due Today</h2>
              <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {todayTasks.length}
              </span>
            </div>
            <Link
              href="/app/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card>
            <div className="divide-y divide-slate-100">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">You're all caught up for today!</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    No urgent tasks due today. Capture new ideas in your inbox or pull in upcoming work.
                  </p>
                  <Link href="/app/tasks" className="inline-block pt-1">
                    <Button variant="outline" size="sm" className="text-xs">
                      Browse Upcoming Tasks
                    </Button>
                  </Link>
                </div>
              ) : (
                todayTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors group"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-950 transition-colors">
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          {proj && (
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: proj.color }}
                              />
                              {proj.name}
                            </span>
                          )}

                          {task.estimatedMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimatedMinutes}m
                            </span>
                          )}

                          {task.subtasks.length > 0 && (
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={`/app/focus?taskId=${task.id}`} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:bg-indigo-50">
                          Focus
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Projects & Recent Activity */}
        <div className="space-y-6">
          {/* Projects Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Active Projects</h2>
              <Link
                href="/app/projects"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {projects.slice(0, 3).map((proj) => {
                const projTasks = tasks.filter((t) => t.projectId === proj.id);
                const completedCount = projTasks.filter((t) => t.status === 'completed').length;
                const percent =
                  projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;

                return (
                  <Link
                    key={proj.id}
                    href={`/app/projects?id=${proj.id}`}
                    className="block p-3 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {proj.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{percent}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: proj.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{completedCount} of {projTasks.length} tasks</span>
                      {proj.targetDate && <span>Target {proj.targetDate}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <Card className="p-3.5 divide-y divide-slate-100">
              {activity.slice(0, 4).map((act) => (
                <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-400">{formatRelativeTime(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
