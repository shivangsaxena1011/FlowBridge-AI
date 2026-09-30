'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  MoreVertical,
  Clock,
  ArrowRight,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { PlanProjectModal } from '@/components/projects/PlanProjectModal';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useFlowBridgeStore } from '@/lib/data/store';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/ui/toast';
import { Project, Task } from '@/types';

export default function ProjectsPage() {
  const { projects, tasks, actions } = useFlowBridgeStore();
  const { success, info } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects[0]?.id || null
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [planningProject, setPlanningProject] = useState<Project | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const percentComplete =
    projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    actions.updateTaskStatus(task.id, nextStatus);
    if (nextStatus === 'completed') {
      success('Task Completed', `"${task.title}" updated.`);
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeProject) return;
    actions.toggleProjectMilestone(activeProject.id, milestoneId);
  };

  const handleDeleteProject = (projId: string) => {
    actions.deleteProject(projId);
    info('Project Deleted', 'Project removed from workspace.');
    const remaining = projects.filter((p) => p.id !== projId);
    setSelectedProjectId(remaining[0]?.id || null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Projects</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transform strategic goals into structured milestones and sequential work.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          className="gap-1.5 text-xs shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Projects Grid / Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((proj) => {
          const pTasks = tasks.filter((t) => t.projectId === proj.id);
          const pCompleted = pTasks.filter((t) => t.status === 'completed').length;
          const pPercent = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;
          const isSelected = activeProject?.id === proj.id;

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <h3 className="font-semibold text-xs text-slate-900 truncate">{proj.name}</h3>
                </div>
                <span className="text-xs font-bold text-slate-700">{pPercent}%</span>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 min-h-[32px]">
                {proj.description || 'No description provided.'}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pPercent}%`, backgroundColor: proj.color }}
                />
              </div>

              <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400">
                <span>{pTasks.length} tasks</span>
                {proj.targetDate && <span>Due {formatDate(proj.targetDate)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Deep Dive */}
      {activeProject ? (
        <div className="space-y-6 pt-2">
          {/* Project Details Banner */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: activeProject.color }}
                />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{activeProject.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeProject.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">{activeProject.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlanningProject(activeProject)}
                className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Plan with AI</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingProject(activeProject);
                  setIsProjectModalOpen(true);
                }}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(activeProject.id)}
                className="h-8 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 2 Column: Milestones & Task List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Milestones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Milestones ({activeProject.milestones.length})
                </h3>
              </div>

              <div className="space-y-2">
                {activeProject.milestones.length === 0 ? (
                  <Card className="p-5 text-center text-xs text-slate-400 space-y-2">
                    <p>No milestones created yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlanningProject(activeProject)}
                      className="text-xs gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Generate with AI</span>
                    </Button>
                  </Card>
                ) : (
                  activeProject.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => handleToggleMilestone(m.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded text-indigo-600 cursor-pointer"
                        />
                        <span
                          className={`text-xs font-semibold leading-tight ${
                            m.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      {m.targetDate && (
                        <p className="text-[10px] text-slate-400 pl-5.5">
                          Target: {formatDate(m.targetDate)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Project Tasks */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tasks ({projectTasks.length})
                </h3>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>

              <Card>
                <div className="divide-y divide-slate-100">
                  {projectTasks.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-700">No tasks in this project</p>
                      <p className="text-[11px] text-slate-400">
                        Click "Plan with AI" to generate a complete phased work package.
                      </p>
                    </div>
                  ) : (
                    projectTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors group"
                      >
                        <button
                          onClick={() => handleToggleTask(t)}
                          className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                        >
                          {t.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-semibold ${
                                t.status === 'completed'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 group-hover:text-indigo-950'
                              }`}
                            >
                              {t.title}
                            </span>
                            <PriorityBadge priority={t.priority} />
                          </div>

                          {t.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                            {t.dueDate && <span>Due {formatDate(t.dueDate)}</span>}
                            {t.estimatedMinutes && <span>~{t.estimatedMinutes}m</span>}
                            {t.subtasks.length > 0 && (
                              <span>
                                {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center space-y-3">
          <p className="text-xs font-semibold text-slate-700">No projects yet</p>
          <Button onClick={() => setIsProjectModalOpen(true)} size="sm">
            Create First Project
          </Button>
        </Card>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />

      {planningProject && (
        <PlanProjectModal
          isOpen={!!planningProject}
          onClose={() => setPlanningProject(null)}
          project={planningProject}
        />
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={null}
      />
    </div>
  );
}
