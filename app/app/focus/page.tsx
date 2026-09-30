'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  SkipForward,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { Modal } from '@/ui/modal';
import { useFlowBridgeStore } from '@/lib/data/store';
import { clientBreakdownTask } from '@/lib/ai/client';
import { TaskBreakdownResult } from '@/lib/ai/types';
import { useToast } from '@/ui/toast';
import { Task } from '@/types';
import confetti from 'canvas-confetti';

function FocusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTaskId = searchParams.get('taskId');

  const { tasks, actions, preferences } = useFlowBridgeStore();
  const { success, info } = useToast();

  // Find candidate tasks
  const uncompletedTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled');

  // Select target task
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [breakdownPlan, setBreakdownPlan] = useState<TaskBreakdownResult | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Timer states
  const [durationMinutes, setDurationMinutes] = useState(preferences.defaultFocusDuration || 25);
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSessionCompletedModalOpen, setIsSessionCompletedModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize selected task
  useEffect(() => {
    if (initialTaskId) {
      const match = tasks.find((t) => t.id === initialTaskId);
      if (match) {
        setSelectedTask(match);
        return;
      }
    }
    // Default to highest priority
    const highestPriority =
      uncompletedTasks.find((t) => t.priority === 'urgent') ||
      uncompletedTasks.find((t) => t.priority === 'high') ||
      uncompletedTasks[0] ||
      null;

    setSelectedTask(highestPriority);
  }, [initialTaskId, tasks]);

  // Load or fetch breakdown when selected task changes
  useEffect(() => {
    if (!selectedTask) return;

    // Reset steps
    setCompletedSteps([]);

    // Check if task already has subtasks
    if (selectedTask.subtasks && selectedTask.subtasks.length > 0) {
      setBreakdownPlan({
        taskTitle: selectedTask.title,
        estimatedTotalMinutes: selectedTask.estimatedMinutes || 30,
        whyThisOrder: 'Sequential execution steps from your task structure.',
        steps: selectedTask.subtasks.map((st, i) => ({
          stepNumber: i + 1,
          title: st.title,
          estimatedMinutes: Math.round((selectedTask.estimatedMinutes || 30) / selectedTask.subtasks.length),
          focusTip: i === 0 ? 'Start here with zero distractions.' : undefined,
        })),
      });
      return;
    }

    // Otherwise generate with AI breakdown
    const fetchBreakdown = async () => {
      setIsLoadingBreakdown(true);
      try {
        const plan = await clientBreakdownTask(selectedTask.title, selectedTask.description);
        setBreakdownPlan(plan);
      } catch {
        // Fallback
      } finally {
        setIsLoadingBreakdown(false);
      }
    };

    fetchBreakdown();
  }, [selectedTask?.id]);

  const handleCompleteSession = () => {
    setIsRunning(false);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const minutesSpent = Math.max(1, Math.round((durationMinutes * 60 - secondsRemaining) / 60));

    actions.saveFocusSession({
      id: 'foc-' + Date.now(),
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title || 'Focused Deep Work',
      durationMinutes,
      actualMinutesSpent: minutesSpent,
      completed: true,
      notes: sessionNotes || undefined,
      startedAt: new Date(Date.now() - minutesSpent * 60000).toISOString(),
      endedAt: new Date().toISOString(),
    });

    setIsSessionCompletedModalOpen(true);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, durationMinutes, secondsRemaining, sessionNotes, selectedTask]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = (newMinutes?: number) => {
    setIsRunning(false);
    const mins = newMinutes || durationMinutes;
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleExtend = (extraMinutes: number) => {
    setSecondsRemaining((prev) => prev + extraMinutes * 60);
    info('Focus Extended', `Added +${extraMinutes} minutes to session.`);
  };

  const handleToggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleFinalizeAndMarkDone = () => {
    if (selectedTask) {
      actions.updateTaskStatus(selectedTask.id, 'completed');
      success('Task Completed', `"${selectedTask.title}" marked as complete!`);
    }
    setIsSessionCompletedModalOpen(false);
    // Pick next task
    const nextTask = uncompletedTasks.find((t) => t.id !== selectedTask?.id) || null;
    setSelectedTask(nextTask);
    handleReset(25);
  };

  const handleSkipTask = () => {
    const currentIndex = uncompletedTasks.findIndex((t) => t.id === selectedTask?.id);
    const nextTask = uncompletedTasks[(currentIndex + 1) % uncompletedTasks.length] || null;
    setSelectedTask(nextTask);
    handleReset(25);
    info('Task Skipped', 'Switched to next candidate task.');
  };

  // Format mm:ss
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = Math.round(
    ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <Flame className="h-3.5 w-3.5" />
          <span>Execution Focus Mode</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Singular Focus Layer
        </h1>
        <p className="text-xs text-slate-500">
          No multitasking. Deconstruct the next high-leverage deliverable and execute without interruption.
        </p>
      </div>

      {/* Target Task Card */}
      {selectedTask ? (
        <Card className="p-5 border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Current Deliverable
                </span>
                <PriorityBadge priority={selectedTask.priority} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {selectedTask.title}
              </h2>
              {selectedTask.description && (
                <p className="text-xs text-slate-600">{selectedTask.description}</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipTask}
              className="text-xs text-slate-400 hover:text-slate-700 shrink-0"
            >
              <SkipForward className="h-3.5 w-3.5 mr-1" />
              Skip
            </Button>
          </div>

          {/* TIMER DISPLAY */}
          <div className="py-6 flex flex-col items-center justify-center space-y-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            {/* Progress ring/pill */}
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-slate-900 tabular-nums">
              {timeFormatted}
            </div>

            {/* Time duration presets */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleReset(15)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  durationMinutes === 15 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                15m Sprint
              </button>
              <button
                onClick={() => handleReset(25)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  durationMinutes === 25 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                25m Pomodoro
              </button>
              <button
                onClick={() => handleReset(50)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  durationMinutes === 50 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                50m Deep Flow
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleStartPause}
                className={`min-w-32 gap-2 text-sm font-semibold shadow-md ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>{secondsRemaining === durationMinutes * 60 ? 'Start Focus' : 'Resume'}</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => handleReset()}
                className="text-xs"
                title="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => handleExtend(5)}
                className="text-xs text-slate-700"
              >
                +5m
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleCompleteSession}
                className="text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Mark Done</span>
              </Button>
            </div>
          </div>

          {/* AI SUGGESTED EXECUTION PLAN */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Step-by-Step Action Plan
              </span>
              <span className="text-[11px] text-slate-400">
                {completedSteps.length} of {breakdownPlan?.steps.length || 0} completed
              </span>
            </div>

            {isLoadingBreakdown ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Sparkles className="h-5 w-5 mx-auto animate-spin text-indigo-600 mb-2" />
                Deconstructing task into micro-steps...
              </div>
            ) : breakdownPlan ? (
              <div className="space-y-2">
                {breakdownPlan.steps.map((step) => {
                  const isDone = completedSteps.includes(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      onClick={() => handleToggleStep(step.stepNumber)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {step.stepNumber}. {step.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ~{step.estimatedMinutes}m
                          </span>
                        </div>
                        {step.focusTip && !isDone && (
                          <p className="text-[10px] text-indigo-700 mt-1 bg-indigo-50/60 p-1.5 rounded border border-indigo-100">
                            💡 {step.focusTip}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero Pending Tasks!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You've completed all active work items. Capture a new goal or take a well-deserved break.
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/app/inbox')}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Capture New Goal</span>
          </Button>
        </Card>
      )}

      {/* SESSION COMPLETE MODAL */}
      <Modal
        isOpen={isSessionCompletedModalOpen}
        onClose={() => setIsSessionCompletedModalOpen(false)}
        title="Session Completed! 🎉"
        description="Deep work session recorded. Keep the momentum going or step away for a breath."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 space-y-1">
            <p className="font-semibold text-sm">
              Logged {durationMinutes} minutes on "{selectedTask?.title || 'Focus Task'}"
            </p>
            <p className="text-emerald-700 text-xs">
              Every completed focus session builds compound execution momentum.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Quick Session Notes (Optional)</label>
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="e.g. Model validation runs finished with 94.2% accuracy."
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSessionCompletedModalOpen(false)}
            >
              Keep Task Open
            </Button>

            <Button
              size="sm"
              onClick={handleFinalizeAndMarkDone}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Task as Completed</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function FocusPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading focus session...</p>
        </div>
      }
    >
      <FocusContent />
    </React.Suspense>
  );
}
