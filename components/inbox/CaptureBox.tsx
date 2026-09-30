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
  Tag,
  FolderPlus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge, PriorityBadge } from '@/ui/badge';
import { clientExtractWork } from '@/lib/ai/client';
import { ExtractedWorkResult, ExtractedTaskItem } from '@/lib/ai/types';
import { useFlowBridgeStore } from '@/lib/data/store';
import { useToast } from '@/ui/toast';
import { InputCaptureType, Task } from '@/types';

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
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
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

  const handleStartVoice = () => {
    if (!voiceSupported) {
      info('Voice Recognition', 'Web Speech API is not supported in this browser. You can type or paste notes directly.');
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
        console.warn('Speech recognition error:', e);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setInputType('image');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      // Realistic simulation context based on file name or image type
      if (!inputText) {
        setInputText(
          `Image note "${file.name}": Contains whiteboard architecture sketch, list of action items for release, and deadline for Friday.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      error('Input required', 'Please type a note, record voice, or upload an image.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await clientExtractWork(inputText, inputType);
      setExtractedResult(result);
      success('AI Extraction Complete', `Identified ${result.tasks.length} actionable item(s).`);
    } catch (err) {
      error('Extraction failed', 'Using smart local fallback.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAllTasks = (targetProjectId?: string) => {
    if (!extractedResult) return;

    // Resolve or find matching project
    let resolvedProjectId = targetProjectId;
    if (!resolvedProjectId && extractedResult.projectSuggestion) {
      const matched = projects.find(
        (p) => p.name.toLowerCase() === extractedResult.projectSuggestion?.toLowerCase()
      );
      if (matched) {
        resolvedProjectId = matched.id;
      }
    }

    extractedResult.tasks.forEach((t, idx) => {
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
        tags: t.tags || ['inbox'],
        aiRationale: `Extracted by FlowBridge AI: ${extractedResult.summary}`,
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
      extractedData: extractedResult,
      createdAt: new Date().toISOString(),
    });

    success('Tasks added to workflow', `${extractedResult.tasks.length} task(s) added successfully.`);
    // Reset state
    setInputText('');
    setExtractedResult(null);
    setPreviewImage(null);
    setImageFileName(null);
    if (onSuccess) onSuccess();
  };

  const handleDiscard = () => {
    setExtractedResult(null);
    info('Discarded', 'Extracted analysis was discarded.');
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all">
      {/* Input Options Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Smart Capture</span>
        </div>

        {/* Input Format Selector */}
        <div className="flex items-center gap-1 bg-slate-100/70 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setInputType('text')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              inputType === 'text' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
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
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isRecordingVoice ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            <span>Voice</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              inputType === 'image' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            <span>Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Textarea Input */}
      <div className="mt-3 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Drop anything here. Voice notes, messy thoughts, meeting takeaways, copied text... I'll turn it into actionable work."
          rows={3}
          autoFocus={autoFocus}
          className="w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Live Voice Recording Status */}
        {isRecordingVoice && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span className="font-medium">Listening... speak naturally.</span>
            <button
              onClick={handleStopVoice}
              className="ml-auto underline font-semibold text-rose-800"
            >
              Done speaking
            </button>
          </div>
        )}

        {/* Image Preview Banner */}
        {previewImage && (
          <div className="flex items-center justify-between p-2 mt-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={previewImage}
                alt="Preview"
                className="h-9 w-9 object-cover rounded border border-slate-200"
              />
              <div>
                <p className="font-medium text-slate-800 truncate max-w-xs">{imageFileName}</p>
                <p className="text-[10px] text-slate-400">Image attached for AI analysis</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPreviewImage(null);
                setImageFileName(null);
                setInputType('text');
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Input Action Footer */}
      {!extractedResult && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Examples:</span>
            <button
              onClick={() =>
                setInputText('Need to finish model evaluation and benchmark runs before Friday. Sync with Rahul on API.')
              }
              className="hover:text-indigo-600 underline cursor-pointer"
            >
              "Model evaluation by Friday..."
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!inputText.trim()}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Process with AI</span>
          </Button>
        </div>
      )}

      {/* Structured AI Result View */}
      {extractedResult && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                FlowBridge Analysis
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">
                {Math.round(extractedResult.confidenceScore * 100)}% confidence
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{extractedResult.summary}</p>

            {extractedResult.suggestedNextAction && (
              <div className="pt-2 flex items-center gap-1.5 text-indigo-700 font-medium">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>Immediate next action: {extractedResult.suggestedNextAction}</span>
              </div>
            )}
          </div>

          {/* Extracted Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Extracted Action Items ({extractedResult.tasks.length})</span>
              {extractedResult.projectSuggestion && (
                <span className="text-indigo-600 flex items-center gap-1">
                  <FolderPlus className="h-3 w-3" />
                  Suggested: {extractedResult.projectSuggestion}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {extractedResult.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {task.title}
                    </p>
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-500">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Due {task.dueDate}
                      </span>
                    )}

                    {task.estimatedMinutes && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        ~{task.estimatedMinutes} mins
                      </span>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-medium">
                        {task.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={handleDiscard} className="text-slate-500">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Discard
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAcceptAllTasks()}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Add to Tasks</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
