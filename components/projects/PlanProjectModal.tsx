'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  FolderPlus,
} from 'lucide-react';
import { Modal } from '@/ui/modal';
import { Button } from '@/ui/button';
import { PriorityBadge } from '@/ui/badge';
import { clientPlanProject } from '@/lib/ai/client';
import { ProjectPlanResult } from '@/lib/ai/types';
import { useFlowBridgeStore } from '@/lib/data/store';
import { useToast } from '@/ui/toast';
import { Project, Task } from '@/types';

interface PlanProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function PlanProjectModal({ isOpen, onClose, project }: PlanProjectModalProps) {
  const { actions } = useFlowBridgeStore();
  const { success, error } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ProjectPlanResult | null>(null);
  const [selectedMilestones, setSelectedMilestones] = useState<Record<number, boolean>>({});
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});
  const [editedMilestones, setEditedMilestones] = useState<Record<number, string>>({});
  const [editedTasks, setEditedTasks] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await clientPlanProject(project.name, project.description);
      setGeneratedPlan(plan);
      
      // Initialize selections to all true
      const mSel: Record<number, boolean> = {};
      const tSel: Record<string, boolean> = {};
      const mEd: Record<number, string> = {};
      const tEd: Record<string, string> = {};

      plan.milestones.forEach((m, mIdx) => {
        mSel[mIdx] = true;
        mEd[mIdx] = m.title;
        m.tasks.forEach((t, tIdx) => {
          tSel[`${mIdx}-${tIdx}`] = true;
          tEd[`${mIdx}-${tIdx}`] = t.title;
        });
      });

      setSelectedMilestones(mSel);
      setSelectedTasks(tSel);
      setEditedMilestones(mEd);
      setEditedTasks(tEd);

      success('AI Roadmap Generated', `Generated ${plan.milestones.length} milestones. Select & customize below.`);
    } catch (err) {
      error('Planning failed', 'Check project parameters or retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRoadmap = () => {
    if (!generatedPlan) return;

    // 1. Filter and update selected milestones
    const acceptedMilestones = generatedPlan.milestones
      .map((m, mIdx) => {
        if (!selectedMilestones[mIdx]) return null;
        return {
          id: `ms-${project.id}-${Date.now()}-${mIdx}`,
          title: editedMilestones[mIdx] || m.title,
          targetDate: m.targetDate,
          completed: false,
          order: m.order || mIdx + 1,
        };
      })
      .filter(Boolean);

    actions.saveProject({
      ...project,
      milestones: [...project.milestones, ...(acceptedMilestones as any[])],
    });

    // 2. Add selected tasks into store
    let taskCount = 0;
    generatedPlan.milestones.forEach((m, mIdx) => {
      // Only include tasks if milestone is also selected
      if (!selectedMilestones[mIdx]) return;

      m.tasks.forEach((t, tIdx) => {
        const key = `${mIdx}-${tIdx}`;
        if (!selectedTasks[key]) return;

        const newTask: Task = {
          id: `task-plan-${Date.now()}-${mIdx}-${tIdx}`,
          title: editedTasks[key] || t.title,
          description: t.description || `Milestone: ${editedMilestones[mIdx] || m.title}`,
          status: 'todo',
          priority: t.priority,
          dueDate: m.targetDate,
          estimatedMinutes: t.estimatedMinutes || 45,
          projectId: project.id,
          subtasks: (t.dependencies || []).map((dep, dIdx) => ({
            id: `sub-dep-${Date.now()}-${dIdx}`,
            title: `Dependency: ${dep}`,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          tags: ['ai-planned', project.name.toLowerCase().split(' ')[0]],
          aiRationale: `Generated during strategic planning for ${project.name}.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        actions.saveTask(newTask);
        taskCount++;
      });
    });

    success('Roadmap Applied', `${taskCount} task(s) and ${acceptedMilestones.length} milestone(s) added.`);
    setGeneratedPlan(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Plan "${project.name}" with AI`}
      description="FlowBridge will decompose this project into sequential milestones, critical dependencies, and estimated task durations. Customize items before saving."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Context Preview */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <p className="font-semibold text-slate-800">Project Goal:</p>
          <p className="text-slate-600">
            {project.description || 'No strategic description provided yet.'}
          </p>
        </div>

        {/* Generate Trigger */}
        {!generatedPlan && (
          <div className="py-6 text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Ready to architect a high-leverage execution roadmap
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                Analyzes goals, computes realistic phase durations, and structures actionable work packages.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="gap-2 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Strategic Plan</span>
            </Button>
          </div>
        )}

        {/* Generated Plan Review */}
        {generatedPlan && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 animate-in fade-in duration-200">
            {/* Executive Summary */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Executive Architecture
                </span>
                <span className="text-[10px] bg-white text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  ~{generatedPlan.suggestedDurationWeeks} Weeks Timeline
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{generatedPlan.executiveSummary}</p>
            </div>

            {/* Risk Factors */}
            {generatedPlan.riskFactors.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Identified Bottlenecks & Risk Factors
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                  {generatedPlan.riskFactors.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Milestones and Tasks Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">
                  Milestones & Action Items ({generatedPlan.milestones.length})
                </p>
                <span className="text-[10px] text-slate-400">
                  Check items to keep & edit titles directly
                </span>
              </div>

              {generatedPlan.milestones.map((m, mIdx) => {
                const isMilestoneSelected = selectedMilestones[mIdx] ?? true;

                return (
                  <div
                    key={mIdx}
                    className={`rounded-xl border transition-all p-3.5 space-y-2.5 ${
                      isMilestoneSelected
                        ? 'border-slate-200 bg-white shadow-2xs'
                        : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isMilestoneSelected}
                        onChange={(e) =>
                          setSelectedMilestones((prev) => ({
                            ...prev,
                            [mIdx]: e.target.checked,
                          }))
                        }
                        className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={editedMilestones[mIdx] ?? m.title}
                          onChange={(e) =>
                            setEditedMilestones((prev) => ({
                              ...prev,
                              [mIdx]: e.target.value,
                            }))
                          }
                          disabled={!isMilestoneSelected}
                          className="w-full text-xs font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5"
                        />
                        {m.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                        )}
                      </div>
                      {m.targetDate && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium shrink-0 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {m.targetDate}
                        </span>
                      )}
                    </div>

                    {/* Tasks inside this milestone */}
                    {isMilestoneSelected && (
                      <div className="space-y-1.5 pl-5 border-l-2 border-indigo-200 ml-1.5">
                        {m.tasks.map((t, tIdx) => {
                          const key = `${mIdx}-${tIdx}`;
                          const isTaskSelected = selectedTasks[key] ?? true;

                          return (
                            <div
                              key={tIdx}
                              className={`flex items-start gap-2 p-2 rounded-lg border transition-all ${
                                isTaskSelected
                                  ? 'bg-slate-50/80 border-slate-200'
                                  : 'bg-slate-100/50 border-slate-100 opacity-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isTaskSelected}
                                onChange={(e) =>
                                  setSelectedTasks((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="mt-1 h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={editedTasks[key] ?? t.title}
                                  onChange={(e) =>
                                    setEditedTasks((prev) => ({
                                      ...prev,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  disabled={!isTaskSelected}
                                  className="w-full text-[11px] font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5"
                                />
                                {t.dependencies && t.dependencies.length > 0 && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Requires: {t.dependencies.join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-400">~{t.estimatedMinutes}m</span>
                                <PriorityBadge priority={t.priority} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedPlan(null)}
                className="text-slate-500"
              >
                Regenerate
              </Button>

              <Button
                size="sm"
                onClick={handleApplyRoadmap}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Add Selected Roadmap & Tasks</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
