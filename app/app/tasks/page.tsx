'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  MoreVertical,
  Flame,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useFlowBridgeStore } from '@/lib/data/store';
import { isTodayDate, isPastDate, formatDate } from '@/lib/utils';
import { useToast } from '@/ui/toast';
import { Task, TaskPriority } from '@/types';

export default function TasksPage() {
  const { tasks, projects, actions } = useFlowBridgeStore();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'today') {
        if (task.status === 'completed' || task.status === 'canceled') return false;
        if (!task.dueDate || !isTodayDate(task.dueDate)) return false;
      } else if (activeTab === 'upcoming') {
        if (task.status === 'completed' || task.status === 'canceled') return false;
        if (!task.dueDate || isPastDate(task.dueDate) || isTodayDate(task.dueDate)) return false;
      } else if (activeTab === 'completed') {
        if (task.status !== 'completed') return false;
      } else {
        // 'all' shows all non-canceled tasks
        if (task.status === 'canceled') return false;
      }

      // Project filter
      if (selectedProject !== 'all' && task.projectId !== selectedProject) return false;

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedProject, selectedPriority, searchQuery]);

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    actions.updateTaskStatus(task.id, nextStatus);
    if (nextStatus === 'completed') {
      success('Completed', `"${task.title}" marked as complete.`);
    }
  };

  const handleDeleteTask = (id: string) => {
    actions.deleteTask(id);
    info('Task Deleted', 'Task removed from workspace.');
  };

  const counts = {
    all: tasks.filter((t) => t.status !== 'canceled').length,
    today: tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isTodayDate(t.dueDate)).length,
    upcoming: tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && !isPastDate(t.dueDate) && !isTodayDate(t.dueDate)).length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Task Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize, prioritize, break down, and execute your commitments with clarity.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="gap-1.5 text-xs shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Tabs & Search Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* View Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.all}</span>
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'today' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Today</span>
            {counts.today > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-1.5 rounded-full font-bold">
                {counts.today}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Upcoming</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.upcoming}</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Completed</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.completed}</span>
          </button>
        </div>

        {/* Filter dropdowns and search */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 w-36 sm:w-44"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <Card>
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">No tasks in this view</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {searchQuery || selectedProject !== 'all' || selectedPriority !== 'all'
                    ? 'Try clearing your search or filter options.'
                    : 'Create a new task or capture notes in your inbox.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Task</span>
              </Button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const isOverdue =
                task.status !== 'completed' && task.dueDate && isPastDate(task.dueDate);
              const isToday =
                task.status !== 'completed' && task.dueDate && isTodayDate(task.dueDate);

              return (
                <div
                  key={task.id}
                  className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold transition-colors ${
                          task.status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 group-hover:text-indigo-950'
                        }`}
                      >
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-500">
                      {project && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </span>
                      )}

                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isToday
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'text-slate-500'
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          {isOverdue ? `Overdue (${formatDate(task.dueDate)})` : isToday ? 'Due Today' : formatDate(task.dueDate)}
                        </span>
                      )}

                      {task.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          ~{task.estimatedMinutes}m
                        </span>
                      )}

                      {task.subtasks.length > 0 && (
                        <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'completed' && (
                      <Link href={`/app/focus?taskId=${task.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-indigo-600 hover:bg-indigo-50"
                        >
                          <Flame className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          Focus
                        </Button>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Task Modal for Create / Edit */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}
