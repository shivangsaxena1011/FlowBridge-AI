'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck2,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { useFlowBridgeStore } from '@/lib/data/store';
import { clientPrioritizeTasks } from '@/lib/ai/client';
import { DailyPlanResult } from '@/lib/ai/types';
import { useToast } from '@/ui/toast';
import { formatDate, isTodayDate, isPastDate } from '@/lib/utils';
import { Task } from '@/types';

export default function TodayPage() {
  const { tasks, projects, actions } = useFlowBridgeStore();
  const { success } = useToast();

  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResult | null>(null);

  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled');

  const runAiPrioritization = async () => {
    setIsPrioritizing(true);
    try {
      const plan = await clientPrioritizeTasks(pendingTasks);
      setDailyPlan(plan);
      success('AI Prioritization Updated', 'Workload ranked by deadline, leverage, and cognitive load.');
    } catch {
      // fallback
    } finally {
      setIsPrioritizing(false);
    }
  };

  useEffect(() => {
    runAiPrioritization();
  }, [tasks.length]);

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    actions.updateTaskStatus(task.id, nextStatus);
    if (nextStatus === 'completed') {
      success('Task Completed', `"${task.title}" checked off.`);
    }
  };

  // Group tasks by daily tier
  const getTasksByTier = (tierName: 'top_priority' | 'must_finish' | 'nice_to_finish' | 'upcoming') => {
    if (!dailyPlan) {
      // Basic fallback grouping
      if (tierName === 'top_priority') return pendingTasks.slice(0, 1);
      if (tierName === 'must_finish') return pendingTasks.slice(1, 4);
      if (tierName === 'nice_to_finish') return pendingTasks.slice(4, 7);
      return pendingTasks.slice(7);
    }

    const taskIdsInTier = dailyPlan.rankedTasks
      .filter((r) => r.tier === tierName)
      .map((r) => r.taskId);

    return pendingTasks.filter((t) => taskIdsInTier.includes(t.id));
  };

  const getRationaleForTask = (taskId: string) => {
    if (!dailyPlan) return null;
    const match = dailyPlan.rankedTasks.find((r) => r.taskId === taskId);
    return match ? match.rationale : null;
  };

  const topPriorityTasks = getTasksByTier('top_priority');
  const mustFinishTasks = getTasksByTier('must_finish');
  const niceToFinishTasks = getTasksByTier('nice_to_finish');
  const upcomingTasks = getTasksByTier('upcoming');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Title & AI Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Today's Workspace</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Execution-first daily plan organized by leverage, deadlines, and dependencies.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={runAiPrioritization}
          isLoading={isPrioritizing}
          className="gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-prioritize with AI</span>
        </Button>
      </div>

      {/* AI Daily Summary Banner */}
      {dailyPlan && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              {dailyPlan.headline}
            </span>
            <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">
              Daily Strategic Blueprint
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">{dailyPlan.summary}</p>

          {dailyPlan.energyRecommendation && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-800 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Energy recommendation: {dailyPlan.energyRecommendation}</span>
            </div>
          )}
        </div>
      )}

      {/* TIER 1: TOP PRIORITY */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Top Priority (The 1 Single Lever)
          </h2>
        </div>

        {topPriorityTasks.length === 0 ? (
          <Card className="p-4 text-center text-xs text-slate-400">
            No top priority designated. Complete pending items or re-prioritize.
          </Card>
        ) : (
          topPriorityTasks.map((task) => {
            const rationale = getRationaleForTask(task.id) || task.aiRationale;
            const project = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-600/60 bg-white shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 text-slate-300 hover:text-indigo-600 cursor-pointer"
                    >
                      <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      )}

                      {rationale && (
                        <div className="mt-2 p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>AI Rationale:</strong> {rationale}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                        {project && (
                          <span className="font-semibold text-slate-700">{project.name}</span>
                        )}
                        {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                        {task.estimatedMinutes && <span>~{task.estimatedMinutes}m estimated</span>}
                      </div>
                    </div>
                  </div>

                  <Link href={`/app/focus?taskId=${task.id}`} className="shrink-0">
                    <Button size="sm" className="gap-1.5 text-xs">
                      <Flame className="h-3.5 w-3.5 text-amber-300" />
                      <span>Start Focus</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TIER 2: MUST FINISH */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Must Finish (Hard Commitments & Blockers)
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
            {mustFinishTasks.length}
          </span>
        </div>

        <Card>
          <div className="divide-y divide-slate-100">
            {mustFinishTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No must-finish tasks scheduled for today.
              </div>
            ) : (
              mustFinishTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/70 group">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-300 hover:text-indigo-600 cursor-pointer"
                  >
                    <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {getRationaleForTask(task.id) && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {getRationaleForTask(task.id)}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                      {task.estimatedMinutes && <span>~{task.estimatedMinutes}m</span>}
                    </div>
                  </div>

                  <Link href={`/app/focus?taskId=${task.id}`} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                      Focus
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* TIER 3: NICE TO FINISH */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Nice to Finish (If Energy Permits)
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
            {niceToFinishTasks.length}
          </span>
        </div>

        <Card>
          <div className="divide-y divide-slate-100">
            {niceToFinishTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No secondary items today.</div>
            ) : (
              niceToFinishTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/70">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-300 hover:text-indigo-600 cursor-pointer"
                  >
                    <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800">{task.title}</span>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                      {task.estimatedMinutes && <span>~{task.estimatedMinutes}m</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
