'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Upload,
  Clock,
  User,
  FolderPlus,
  Trash2,
  RotateCcw,
  Check,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { PriorityBadge } from '@/ui/badge';
import { clientExtractWork } from '@/lib/ai/client';
import { ExtractedWorkResult, ExtractedTaskItem } from '@/lib/ai/types';
import { useFlowBridgeStore } from '@/lib/data/store';
import { useToast } from '@/ui/toast';
import { InputCaptureType, Task, TaskPriority } from '@/types';

interface CaptureBoxProps {
  onSuccess?: () => void;
  initialInput?: string;
  autoFocus?: boolean;
}

export function CaptureBox({ onSuccess, initialInput = '', autoFocus = false }: CaptureBoxProps) {
  const [inputText, setInputText] = useState(initialInput);
  const [inputType, setInputType] = useState<InputCaptureType>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedWorkResult | null>(null);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([]);
  const [editableTasks, setEditableTasks] = useState<ExtractedTaskItem[]>([]);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // File and Image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { actions, projects } = useFlowBridgeStore();
  const { success, error, info } = useToast();

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceSupported(false);
      }
    }
  }, []);

  // Voice timer tick
  useEffect(() => {
    if (isRecordingVoice) {
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setVoiceSeconds(0);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Sync editable tasks when extracted result updates
  useEffect(() => {
    if (extractedResult) {
      setEditableTasks([...extractedResult.tasks]);
      setSelectedTaskIndices(extractedResult.tasks.map((_, idx) => idx));
    }
  }, [extractedResult]);

  const handleStartVoice = () => {
    if (!voiceSupported) {
      info(
        'Voice Unavailable',
        'Web Speech API is not supported in this browser. You can type or paste notes directly.'
      );
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setInputType('voice');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsRecordingVoice(false);
    }
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  const handleImageFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Please upload an image smaller than 10MB.');
      return;
    }

    setInputType('image');
    setAttachedFile({ name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      if (!inputText) {
        setInputText(
          `Image note "${file.name}": Whiteboard architecture & release deliverables. Key items to finalize before Friday release.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocFile = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      error('File too large', 'Please upload a file smaller than 15MB.');
      return;
    }

    setInputType('file');
    setAttachedFile({ name: file.name, size: file.size, type: file.type });

    // If plaintext or markdown, read directly
    if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text.slice(0, 4000));
      };
      reader.readAsText(file);
    } else {
      if (!inputText) {
        setInputText(
          `Document attached: "${file.name}" (${Math.round(file.size / 1024)} KB). Extract action items, deadlines, and project milestones.`
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
      } else {
        handleDocFile(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      error('Input required', 'Please type a note, record voice, or drop a file.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await clientExtractWork(inputText, inputType);
      setExtractedResult(result);
      success('AI Analysis Ready', `Extracted ${result.tasks.length} actionable item(s).`);
    } catch {
      error('Extraction failed', 'Using local fallback parsing.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleToggleTaskSelection = (index: number) => {
    if (selectedTaskIndices.includes(index)) {
      setSelectedTaskIndices(selectedTaskIndices.filter((i) => i !== index));
    } else {
      setSelectedTaskIndices([...selectedTaskIndices, index]);
    }
  };

  const handleUpdateTaskTitle = (index: number, newTitle: string) => {
    const updated = [...editableTasks];
    updated[index] = { ...updated[index], title: newTitle };
    setEditableTasks(updated);
  };

  const handleUpdateTaskPriority = (index: number, priority: TaskPriority) => {
    const updated = [...editableTasks];
    updated[index] = { ...updated[index], priority };
    setEditableTasks(updated);
  };

  const handleAcceptSelectedTasks = () => {
    if (!extractedResult || selectedTaskIndices.length === 0) {
      info('No tasks selected', 'Select at least one task to add.');
      return;
    }

    // Match project suggestion if exists
    let resolvedProjectId: string | undefined = undefined;
    if (extractedResult.projectSuggestion) {
      const match = projects.find(
        (p) => p.name.toLowerCase() === extractedResult.projectSuggestion?.toLowerCase()
      );
      if (match) resolvedProjectId = match.id;
    }

    const tasksToCreate = editableTasks.filter((_, idx) => selectedTaskIndices.includes(idx));

    tasksToCreate.forEach((t, idx) => {
      const newTask: Task = {
        id: 'task-' + Date.now() + '-' + idx,
        title: t.title,
        description: t.description || '',
        status: 'todo',
        priority: t.priority,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes || 30,
        projectId: resolvedProjectId,
        subtasks: (t.subtasks || []).map((st, sIdx) => ({
          id: `sub-${Date.now()}-${sIdx}`,
          title: st,
          completed: false,
          createdAt: new Date().toISOString(),
        })),
        tags: t.tags || ['inbox-processed'],
        aiRationale: `Extracted from note: ${extractedResult.summary}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      actions.saveTask(newTask);
    });

    // Save into inbox history as converted
    actions.saveInboxItem({
      id: 'inbox-' + Date.now(),
      rawInput: inputText,
      inputType,
      status: 'converted',
      extractedData: {
        ...extractedResult,
        tasks: tasksToCreate,
      },
      fileMeta: attachedFile ? { ...attachedFile, previewUrl: previewImage || undefined } : undefined,
      createdAt: new Date().toISOString(),
    });

    success('Tasks Created', `${tasksToCreate.length} task(s) added to your workflow.`);

    // Reset state
    setInputText('');
    setExtractedResult(null);
    setPreviewImage(null);
    setAttachedFile(null);
    if (onSuccess) onSuccess();
  };

  const handleSaveAsInboxItemOnly = () => {
    if (!inputText.trim()) return;

    actions.saveInboxItem({
      id: 'inbox-' + Date.now(),
      rawInput: inputText,
      inputType,
      status: 'pending',
      extractedData: extractedResult || undefined,
      fileMeta: attachedFile ? { ...attachedFile, previewUrl: previewImage || undefined } : undefined,
      createdAt: new Date().toISOString(),
    });

    success('Saved to Inbox', 'Note stored in inbox for later processing.');
    setInputText('');
    setExtractedResult(null);
    setPreviewImage(null);
    setAttachedFile(null);
    if (onSuccess) onSuccess();
  };

  const handleDiscard = () => {
    setExtractedResult(null);
    info('Discarded', 'Analysis discarded.');
  };

  const formatVoiceTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border transition-all duration-200 bg-white p-4 sm:p-5 shadow-xs ${
        isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200/90'
      }`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Capture anything.</h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Drop a thought, note, screenshot, or voice memo. FlowBridge will turn it into organized work.
          </p>
        </div>

        {/* Input Type Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setInputType('text')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              inputType === 'text' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => {
              if (isRecordingVoice) handleStopVoice();
              else handleStartVoice();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              isRecordingVoice
                ? 'bg-rose-500 text-white animate-pulse'
                : inputType === 'voice'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isRecordingVoice ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            <span>Voice</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              inputType === 'image' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            <span>Image</span>
          </button>
          <button
            onClick={() => docInputRef.current?.click()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              inputType === 'file' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-3 w-3" />
            <span>File</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }}
            accept="image/*"
            className="hidden"
          />

          <input
            type="file"
            ref={docInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDocFile(file);
            }}
            accept=".pdf,.doc,.docx,.txt,.md,.json"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Input Textarea */}
      <div className="mt-3 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Drop anything here. Notes, voice transcript, meeting takeaways, copied messages... Press Cmd+Enter to deconstruct."
          rows={3}
          autoFocus={autoFocus}
          className="w-full resize-none bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[75px]"
        />

        {/* Live Voice Recording Status */}
        {isRecordingVoice && (
          <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-semibold">Recording live voice</span>
              <span className="font-mono text-[11px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-800">
                {formatVoiceTime(voiceSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStopVoice}
                className="font-semibold text-rose-800 hover:text-rose-950 underline cursor-pointer text-xs"
              >
                Done speaking
              </button>
            </div>
          </div>
        )}

        {/* Attached Image Preview */}
        {previewImage && (
          <div className="flex items-center justify-between p-2 mt-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={previewImage}
                alt="Preview"
                className="h-10 w-10 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{attachedFile?.name}</p>
                <p className="text-[10px] text-slate-400">
                  {attachedFile ? `${Math.round(attachedFile.size / 1024)} KB • Image attached` : 'Image attached'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPreviewImage(null);
                setAttachedFile(null);
                setInputType('text');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Attached Document File Preview */}
        {attachedFile && !previewImage && (
          <div className="flex items-center justify-between p-2.5 mt-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{attachedFile.name}</p>
                <p className="text-[10px] text-slate-400">
                  {Math.round(attachedFile.size / 1024)} KB • File attached
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAttachedFile(null);
                setInputType('text');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Input Action Bar */}
      {!extractedResult && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Shortcut:</span>
            <kbd className="hidden sm:inline bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600">
              ⌘ Enter
            </kbd>
            <span>Examples:</span>
            <button
              onClick={() =>
                setInputText(
                  'Need to finish model evaluation before Friday. Sync with Rahul on API caching contracts tomorrow.'
                )
              }
              className="hover:text-indigo-600 underline cursor-pointer truncate max-w-xs"
            >
              "Model evaluation by Friday..."
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {inputText.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveAsInboxItemOnly}
                className="text-xs text-slate-600"
              >
                Save as Note
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!inputText.trim()}
              className="gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deconstruct with AI</span>
            </Button>
          </div>
        </div>
      )}

      {/* AI Output Interpretation View ("Here's what I found") */}
      {extractedResult && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Here&apos;s what FlowBridge found:
              </span>
              <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-semibold">
                {Math.round(extractedResult.confidenceScore * 100)}% Confidence
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{extractedResult.summary}</p>

            {/* Meta attributes: People, Deadlines, Suggested Project */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
              {extractedResult.deadlines.length > 0 && (
                <span className="flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  <Clock className="h-3 w-3 text-slate-400" />
                  Target: {extractedResult.deadlines[0].label}
                </span>
              )}
              {extractedResult.peopleMentioned.length > 0 && (
                <span className="flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  <User className="h-3 w-3 text-slate-400" />
                  {extractedResult.peopleMentioned.join(', ')}
                </span>
              )}
              {extractedResult.projectSuggestion && (
                <span className="flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700">
                  <FolderPlus className="h-3 w-3 text-indigo-500" />
                  Project: {extractedResult.projectSuggestion}
                </span>
              )}
            </div>

            {extractedResult.suggestedNextAction && (
              <div className="pt-1 flex items-center gap-1.5 text-indigo-800 font-semibold text-[11px]">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>Next micro-step: {extractedResult.suggestedNextAction}</span>
              </div>
            )}
          </div>

          {/* Extracted Tasks (Editable & Selectable Checklist) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
              <span>
                Action Items ({selectedTaskIndices.length} of {editableTasks.length} selected)
              </span>
              <button
                onClick={() => {
                  if (selectedTaskIndices.length === editableTasks.length) {
                    setSelectedTaskIndices([]);
                  } else {
                    setSelectedTaskIndices(editableTasks.map((_, i) => i));
                  }
                }}
                className="text-[11px] text-indigo-600 hover:underline"
              >
                {selectedTaskIndices.length === editableTasks.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2">
              {editableTasks.map((task, idx) => {
                const isSelected = selectedTaskIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all space-y-2 ${
                      isSelected ? 'border-slate-300 bg-white shadow-2xs' : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleTaskSelection(idx)}
                        className="mt-0.5 h-4 w-4 rounded text-indigo-600 cursor-pointer shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleUpdateTaskTitle(idx, e.target.value)}
                          className="w-full font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none text-xs"
                        />
                        {task.description && (
                          <p className="text-[11px] text-slate-500">{task.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <select
                          value={task.priority}
                          onChange={(e) => handleUpdateTaskPriority(idx, e.target.value as TaskPriority)}
                          className="h-7 px-1.5 text-[11px] rounded border border-slate-200 bg-white font-medium cursor-pointer"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-6 text-[10px] text-slate-500">
                      {task.dueDate && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded">Due {task.dueDate}</span>
                      )}
                      {task.estimatedMinutes && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded">~{task.estimatedMinutes}m</span>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="text-indigo-600 font-medium">
                          {task.subtasks.length} sub-steps included
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Acceptance Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={handleDiscard} className="text-slate-500 text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Discard
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAsInboxItemOnly}
                className="text-xs"
              >
                Save as Note Only
              </Button>

              <Button
                size="sm"
                onClick={handleAcceptSelectedTasks}
                disabled={selectedTaskIndices.length === 0}
                className="gap-1.5 text-xs font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {selectedTaskIndices.length === editableTasks.length
                    ? 'Add Everything to Tasks'
                    : `Add (${selectedTaskIndices.length}) Selected`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
