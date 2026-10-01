'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Plus,
  Search,
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  Flame,
  Trash2,
  Edit2,
  ArrowUpDown,
  Check,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { Modal } from '@/ui/modal';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useFlowBridgeStore } from '@/lib/data/store';
import { isTodayDate, isPastDate, formatDate } from '@/lib/utils';
import { useToast } from '@/ui/toast';
import { Task } from '@/types';

export default function TasksPage() {
  const { tasks, projects, actions } = useFlowBridgeStore();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('priority');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Bulk selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
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
        if (task.status === 'canceled') return false;
      }

      // Project filter
      if (selectedProject !== 'all' && task.projectId !== selectedProject) return false;

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

      // Tag filter
      if (selectedTag !== 'all' && !task.tags?.includes(selectedTag)) return false;

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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'createdAt') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });

    return result;
  }, [tasks, activeTab, selectedProject, selectedPriority, selectedTag, searchQuery, sortBy]);

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    actions.updateTaskStatus(task.id, nextStatus);
    if (nextStatus === 'completed') {
      success('Completed', `"${task.title}" marked as complete.`);
    }
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    actions.deleteTask(taskToDelete);
    info('Task Deleted', 'Task removed from workspace.');
    setTaskToDelete(null);
  };

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleToggleSelectId = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((i) => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleBulkComplete = () => {
    selectedTaskIds.forEach((id) => {
      actions.updateTaskStatus(id, 'completed');
    });
    success('Bulk Complete', `Marked ${selectedTaskIds.length} tasks as complete.`);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach((id) => {
      actions.deleteTask(id);
    });
    info('Bulk Delete', `Deleted ${selectedTaskIds.length} tasks.`);
    setSelectedTaskIds([]);
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
          className="gap-1.5 text-xs shadow-xs self-start sm:self-auto font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Tabs & Search & Sort Filter Row */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.all}</span>
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'today' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
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
                activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Upcoming</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.upcoming}</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'completed' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Completed</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full">{counts.completed}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, or tags..."
              className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 w-full"
            />
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
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
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5 ml-auto text-slate-500">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="priority">Priority (High to Low)</option>
              <option value="dueDate">Due Date (Earliest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Banner */}
        {selectedTaskIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 animate-in fade-in">
            <span className="font-semibold">
              {selectedTaskIds.length} task(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleBulkComplete} className="h-7 text-xs gap-1 bg-white">
                <Check className="h-3 w-3 text-emerald-600" />
                <span>Mark Completed</span>
              </Button>
              <Button size="sm" variant="danger" onClick={handleBulkDelete} className="h-7 text-xs gap-1">
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Task List Table */}
      <Card>
        <div className="divide-y divide-slate-100">
          {/* Header row with Select All */}
          {filteredTasks.length > 0 && (
            <div className="px-4 py-2 bg-slate-50/70 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <input
                type="checkbox"
                checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                onChange={handleToggleSelectAll}
                className="h-3.5 w-3.5 rounded text-indigo-600 cursor-pointer"
                title="Select all tasks"
              />
              <span>Select all {filteredTasks.length} visible tasks</span>
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">No tasks in this view</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {searchQuery || selectedProject !== 'all' || selectedPriority !== 'all' || selectedTag !== 'all'
                    ? 'Try clearing your active filters.'
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
              const isSelected = selectedTaskIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 transition-colors group ${
                    isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Bulk selection checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectId(task.id)}
                    className="mt-1 h-3.5 w-3.5 rounded text-indigo-600 cursor-pointer shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                  />

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

                  {/* Task Info (Click to open edit modal) */}
                  <div
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
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
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[10px] text-slate-500">
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

                      {task.tags?.map((t) => (
                        <span key={t} className="text-slate-400">
                          #{t}
                        </span>
                      ))}
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
                      onClick={() => setTaskToDelete(task.id)}
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

      {/* Confirmation Dialog before deleting */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task?"
        description="Are you sure you want to delete this task from your workspace? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setTaskToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>

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
