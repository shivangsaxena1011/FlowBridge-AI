'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Clock,
  User,
  FolderPlus,
  Filter,
  Search,
} from 'lucide-react';
import { CaptureBox } from '@/components/inbox/CaptureBox';
import { useFlowBridgeStore } from '@/lib/data/store';
import { PriorityBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { useToast } from '@/ui/toast';
import { formatRelativeTime } from '@/lib/utils';
import { InboxItem, Task } from '@/types';

export default function InboxPage() {
  const { inboxItems, projects, actions } = useFlowBridgeStore();
  const { success, info } = useToast();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'converted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = inboxItems.filter((item) => {
    if (filterStatus === 'pending' && item.status !== 'pending' && item.status !== 'processed')
      return false;
    if (filterStatus === 'converted' && item.status !== 'converted') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRaw = item.rawInput.toLowerCase().includes(q);
      const matchSummary = item.extractedData?.summary.toLowerCase().includes(q);
      return matchRaw || matchSummary;
    }
    return true;
  });

  const handleConvertExtractedTasks = (item: InboxItem) => {
    if (!item.extractedData) return;

    item.extractedData.tasks.forEach((t, idx) => {
      const newTask: Task = {
        id: 'task-' + Date.now() + '-' + idx,
        title: t.title,
        description: t.description || '',
        status: 'todo',
        priority: t.priority,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes || 30,
        subtasks: (t.subtasks || []).map((st, sIdx) => ({
          id: `sub-${Date.now()}-${sIdx}`,
          title: st,
          completed: false,
          createdAt: new Date().toISOString(),
        })),
        tags: t.tags || ['inbox'],
        aiRationale: `Extracted from note: ${item.extractedData?.summary}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      actions.saveTask(newTask);
    });

    actions.saveInboxItem({
      ...item,
      status: 'converted',
    });

    success('Tasks Added', `${item.extractedData.tasks.length} task(s) added to your active workflow.`);
  };

  const handleDeleteItem = (id: string) => {
    actions.deleteInboxItem(id);
    info('Item Removed', 'Inbox item deleted.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Title & Intro */}
      <div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Inbox className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Smart Inbox</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Capture unstructured thoughts, voice notes, screenshots, or meetings. FlowBridge will parse, prioritize, and turn them into execution-ready work.
        </p>
      </div>

      {/* Primary Capture Box */}
      <CaptureBox autoFocus={false} />

      {/* Past Captures / History */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Capture History</h2>
            <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {filteredItems.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Unconverted
              </button>
              <button
                onClick={() => setFilterStatus('converted')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterStatus === 'converted'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Converted
              </button>
            </div>
          </div>
        </div>

        {/* List of Inbox Items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No items match your filter</p>
              <p className="text-[11px] text-slate-400">
                Use the capture box above to add notes, voice memos, or screenshot images.
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="p-4 space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.inputType}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.status === 'converted' && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3" /> Converted to Tasks
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 font-medium italic mt-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                      "{item.rawInput}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Extracted Details If Available */}
                {item.extractedData && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        {item.extractedData.summary}
                      </p>
                      {item.extractedData.projectSuggestion && (
                        <span className="text-[10px] font-medium text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          {item.extractedData.projectSuggestion}
                        </span>
                      )}
                    </div>

                    {/* Extracted Tasks Pill List */}
                    <div className="space-y-1.5 pt-1">
                      {item.extractedData.tasks.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-slate-800 truncate">{t.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {t.dueDate && (
                              <span className="text-[10px] text-slate-400">Due {t.dueDate}</span>
                            )}
                            <PriorityBadge priority={t.priority} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metadata tags: people and next action */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      {item.extractedData.peopleMentioned.length > 0 && (
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <User className="h-3 w-3 text-slate-400" />
                          {item.extractedData.peopleMentioned.join(', ')}
                        </span>
                      )}
                      {item.extractedData.suggestedNextAction && (
                        <span className="flex items-center gap-1 text-indigo-700 font-medium">
                          <ArrowRight className="h-3 w-3" />
                          {item.extractedData.suggestedNextAction}
                        </span>
                      )}
                    </div>

                    {/* If not converted yet, provide button */}
                    {item.status !== 'converted' && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleConvertExtractedTasks(item)}
                          className="gap-1.5 text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Add to Active Tasks</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
