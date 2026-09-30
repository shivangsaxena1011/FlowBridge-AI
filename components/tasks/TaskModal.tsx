'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  FolderKanban,
  CheckCircle2,
  Tag,
  Flame,
} from 'lucide-react';
import { Modal } from '@/ui/modal';
import { Button } from '@/ui/button';
import { Input, Textarea } from '@/ui/input';
import { PriorityBadge } from '@/ui/badge';
import { useFlowBridgeStore } from '@/lib/data/store';
import { clientBreakdownTask } from '@/lib/ai/client';
import { useToast } from '@/ui/toast';
import { Task, TaskPriority, TaskStatus, Subtask } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { projects, actions } = useFlowBridgeStore();
  const { success, info } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [projectId, setProjectId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || '');
      setEstimatedMinutes(task.estimatedMinutes || 30);
      setProjectId(task.projectId || '');
      setSubtasks(task.subtasks || []);
      setTags(task.tags || []);
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate(new Date().toISOString().split('T')[0]);
      setEstimatedMinutes(30);
      setProjectId('');
      setSubtasks([]);
      setTags([]);
    }
  }, [task, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleBreakdownWithAi = async () => {
    if (!title.trim()) {
      info('Title required', 'Provide a task title first to break it down.');
      return;
    }
    setIsBreakingDown(true);
    try {
      const breakdown = await clientBreakdownTask(title, description);
      const generatedSubtasks: Subtask[] = breakdown.steps.map((step, idx) => ({
        id: `sub-ai-${Date.now()}-${idx}`,
        title: `${step.title} (~${step.estimatedMinutes}m)`,
        completed: false,
        createdAt: new Date().toISOString(),
      }));

      setSubtasks((prev) => [...prev, ...generatedSubtasks]);
      if (breakdown.estimatedTotalMinutes) {
        setEstimatedMinutes(breakdown.estimatedTotalMinutes);
      }
      success('Task Broken Down', `Generated ${breakdown.steps.length} sequential execution steps.`);
    } catch {
      info('Notice', 'AI breakdown generated fallback steps.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Task = {
      id: task ? task.id : 'task-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      projectId: projectId || undefined,
      subtasks,
      tags,
      completedAt: status === 'completed' ? task?.completedAt || new Date().toISOString() : undefined,
      createdAt: task ? task.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    actions.saveTask(taskData);
    success(task ? 'Task Updated' : 'Task Created', `"${taskData.title}" saved.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      description="Define scope, priority, and actionable breakdown steps."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Task Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Conduct benchmark evaluation across test split"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Context & Notes</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Relevant context, links, or expectations..."
            rows={2}
          />
        </div>

        {/* Priority & Status Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Due Date & Project Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" /> Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <FolderKanban className="h-3 w-3 text-slate-400" /> Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">No Project (Standalone)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subtasks with AI Breakdown Action */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700">
              Subtasks / Execution Steps ({subtasks.length})
            </label>
            <button
              type="button"
              onClick={handleBreakdownWithAi}
              disabled={isBreakingDown}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>{isBreakingDown ? 'Analyzing...' : 'AI Break Down'}</span>
            </button>
          </div>

          {/* Subtask items */}
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="h-3.5 w-3.5 rounded text-indigo-600 cursor-pointer"
                  />
                  <span
                    className={`text-xs truncate ${
                      st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex gap-2 pt-1">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add next micro-step..."
              className="h-8 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubtask}
              className="h-8 shrink-0 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{task ? 'Save Changes' : 'Create Task'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
