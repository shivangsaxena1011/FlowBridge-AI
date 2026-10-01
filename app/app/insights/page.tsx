'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Zap,
} from 'lucide-react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { useFlowBridgeStore } from '@/lib/data/store';
import { computeProductivityMetrics } from '@/lib/data/analytics';

export default function InsightsPage() {
  const { tasks, projects, focusSessions } = useFlowBridgeStore();

  const metrics = computeProductivityMetrics(tasks, projects, focusSessions);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Productivity & Execution Insights
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Objective telemetry derived strictly from your stored activity, completed deliverables, and deep work sessions.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.completionRate}%</p>
          <p className="text-[11px] text-slate-400">
            {metrics.completedTasks} of {metrics.totalTasks} tasks done
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Deep Work Logged</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.round((metrics.totalFocusMinutes / 60) * 10) / 10}h
          </p>
          <p className="text-[11px] text-slate-400">
            {metrics.totalFocusSessions} focus sessions
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Overdue Backlog</p>
          <p className="text-2xl font-bold text-rose-600">{metrics.overdueTasks}</p>
          <p className="text-[11px] text-slate-400">Past target date</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Peak Window</p>
          <p className="text-2xl font-bold text-emerald-600">{metrics.peakProductivityPeriod}</p>
          <p className="text-[11px] text-slate-400">Highest output window</p>
        </Card>
      </div>

      {/* AI Behavioral Observations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Execution Pattern Diagnostics</h2>
        </div>

        {metrics.insights.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700">Your insights will appear as you work.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Complete tasks, plan projects, or finish focus sessions to generate objective behavioral observations and execution velocity diagnostics.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.insights.map((ins) => (
              <Card
                key={ins.id}
                className={`p-4 border ${
                  ins.type === 'warning'
                    ? 'border-amber-200 bg-amber-50/30'
                    : ins.type === 'positive'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-indigo-200 bg-indigo-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">{ins.title}</h3>
                  {ins.metric && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0">
                      {ins.metric}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {ins.description}
                </p>
                {ins.actionLabel && ins.actionRoute && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60">
                    <Link
                      href={ins.actionRoute}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>{ins.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Workload Distribution and Project Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Open Tasks by Urgency
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-rose-700">Urgent</span>
                <span className="font-bold text-slate-800">{metrics.priorityBreakdown.urgent}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      metrics.pendingTasks > 0
                        ? (metrics.priorityBreakdown.urgent / metrics.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-700">High Priority</span>
                <span className="font-bold text-slate-800">{metrics.priorityBreakdown.high}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      metrics.pendingTasks > 0
                        ? (metrics.priorityBreakdown.high / metrics.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-blue-700">Medium Priority</span>
                <span className="font-bold text-slate-800">{metrics.priorityBreakdown.medium}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      metrics.pendingTasks > 0
                        ? (metrics.priorityBreakdown.medium / metrics.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">Low Priority</span>
                <span className="font-bold text-slate-800">{metrics.priorityBreakdown.low}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      metrics.pendingTasks > 0
                        ? (metrics.priorityBreakdown.low / metrics.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Project Delivery Health */}
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Project Health & Delivery Velocity
          </h3>

          <div className="space-y-3.5">
            {metrics.projectStats.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  <span className="font-bold text-slate-700">{p.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${p.percentage}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{p.completedTasks} completed</span>
                  <span>{p.totalTasks - p.completedTasks} remaining</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
