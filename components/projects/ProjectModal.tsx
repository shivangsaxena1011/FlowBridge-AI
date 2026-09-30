'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/modal';
import { Button } from '@/ui/button';
import { Input, Textarea } from '@/ui/input';
import { useFlowBridgeStore } from '@/lib/data/store';
import { useToast } from '@/ui/toast';
import { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#0284c7', // Sky
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
];

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { actions } = useFlowBridgeStore();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setColor(project.color || COLOR_PRESETS[0]);
      setTargetDate(project.targetDate || '');
    } else {
      setName('');
      setDescription('');
      setColor(COLOR_PRESETS[0]);
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setTargetDate(nextMonth.toISOString().split('T')[0]);
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Project = {
      id: project ? project.id : 'proj-' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      color,
      status: project ? project.status : 'active',
      targetDate: targetDate || undefined,
      milestones: project ? project.milestones : [],
      createdAt: project ? project.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    actions.saveProject(data);
    success(project ? 'Project Updated' : 'Project Created', `"${data.name}" saved.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'New Project'}
      description="Define milestone goals, timeline, and color theme."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Autonomous Agents Showcase"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Strategic Goal & Overview</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summarize the core outcome and deliverables..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Date</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Accent Color</label>
            <div className="flex items-center gap-1.5 pt-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
