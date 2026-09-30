'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Sparkles,
  Database,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Input } from '@/ui/input';
import { useFlowBridgeStore } from '@/lib/data/store';
import { useToast } from '@/ui/toast';
import { UserPreferences, AISettings } from '@/types';

export default function SettingsPage() {
  const { preferences, actions } = useFlowBridgeStore();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'data' | 'privacy'>('profile');

  // Form states
  const [name, setName] = useState(preferences.name);
  const [email, setEmail] = useState(preferences.email);
  const [role, setRole] = useState(preferences.role);
  const [focusDuration, setFocusDuration] = useState(preferences.defaultFocusDuration || 25);

  // AI settings
  const [aiSettings, setAiSettings] = useState<AISettings>(actions.getAISettings());
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    actions.saveUserPreferences({
      name,
      email,
      role,
      defaultFocusDuration: Number(focusDuration) || 25,
    });
    success('Profile Updated', 'User preferences saved successfully.');
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    actions.saveAISettings({
      provider: aiSettings.provider,
      model: aiSettings.model,
      baseUrl: aiSettings.baseUrl,
    });
    success('AI Configuration Saved', 'Engine routing preferences updated.');
  };

  const handleExportData = () => {
    const jsonStr = actions.exportAllJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowbridge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Data Exported', 'Full workspace JSON backup downloaded.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = actions.importJson(content);
      if (ok) {
        success('Data Imported', 'Workspace restored successfully.');
      } else {
        error('Import Failed', 'Invalid JSON backup format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeed = () => {
    if (confirm('Reset workspace to initial seed data? Your current changes will be overwritten.')) {
      actions.resetToSeed();
      success('Workspace Reset', 'Loaded realistic initial startup data.');
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all workspace data? This will erase all tasks, projects, and history.')) {
      actions.clearAll();
      info('Workspace Cleared', 'All local items removed.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SettingsIcon className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage workspace profile, AI runtime engine, local data persistence, and privacy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs self-start max-w-md">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'ai' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Engine
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'data' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Data & Backup
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'privacy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Privacy
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <Card className="p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
            <p className="text-xs text-slate-500">Personalize your FlowBridge experience.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Role / Title</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Default Focus Duration (mins)</label>
                <select
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value={15}>15 Minutes (Sprint)</option>
                  <option value={25}>25 Minutes (Standard Pomodoro)</option>
                  <option value={50}>50 Minutes (Deep Flow Block)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="sm" className="text-xs">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* AI ENGINE TAB */}
      {activeTab === 'ai' && (
        <Card className="p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI Provider & Intelligence Mode</h2>
            <p className="text-xs text-slate-500">
              FlowBridge automatically routes between cloud LLMs (OpenAI, Gemini) and a deterministic local intelligence engine.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Multi-Tier Intelligence Architecture
            </p>
            <p className="text-slate-700 leading-relaxed">
              When external credentials (e.g. <code>AI_API_KEY</code>) are configured on your server, cloud reasoning is active. If credentials are not provided or offline, FlowBridge operates in polished <strong>local deterministic mode</strong> without crashing or showing error banners.
            </p>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Execution Mode</label>
              <select
                value={aiSettings.provider}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, provider: e.target.value as any })
                }
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="auto">Automatic (Cloud with Deterministic Local Fallback)</option>
                <option value="local">Local Intelligence Mode (Zero external latency)</option>
                <option value="openai">OpenAI Compatible Provider</option>
                <option value="gemini">Google Gemini Engine</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Model Name</label>
              <Input
                value={aiSettings.model || 'gpt-4o-mini'}
                onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                placeholder="e.g. gpt-4o-mini or gemini-1.5-flash"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Custom Base URL (Optional)</label>
              <Input
                value={aiSettings.baseUrl || ''}
                onChange={(e) => setAiSettings({ ...aiSettings, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1 or custom Ollama proxy"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" size="sm" className="text-xs">
                Save AI Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* DATA & BACKUP TAB */}
      {activeTab === 'data' && (
        <Card className="p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Workspace Data Management</h2>
            <p className="text-xs text-slate-500">
              FlowBridge stores data in local persistence with export and backup capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Download className="h-4 w-4 text-indigo-600" />
                <span>Export JSON Backup</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Download a clean, structured JSON file containing all tasks, projects, inbox captures, and focus logs.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="text-xs gap-1.5 w-full mt-2"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Full Backup</span>
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>Restore from JSON</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Upload a previously exported FlowBridge backup file to restore your entire workspace.
              </p>
              <label className="inline-flex items-center justify-center font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs text-slate-700 shadow-xs cursor-pointer w-full mt-2">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                <span>Select JSON File</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Dangerous / Maintenance zone */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Maintenance & Reset</h3>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToSeed}
                className="gap-1.5 text-xs text-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
                <span>Reset to Believable Seed Data</span>
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleClearAll}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Data</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PRIVACY TAB */}
      {activeTab === 'privacy' && (
        <Card className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Privacy & Data Governance</h2>
            <p className="text-slate-500">Security principles governing FlowBridge AI.</p>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <p className="font-semibold text-slate-800">1. Client Data Isolation</p>
              <p className="text-[11px]">
                Your personal notes, voice transcripts, and tasks persist locally within your browser by default. No centralized training telemetry is stored.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <p className="font-semibold text-slate-800">2. Zero Secrets in Client Bundles</p>
              <p className="text-[11px]">
                All external AI requests are processed through secured server-side route handlers. Your API keys are never exposed in browser script tags.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <p className="font-semibold text-slate-800">3. Vercel & Production Readiness</p>
              <p className="text-[11px]">
                Fully deployable to Vercel with zero runtime dependencies on external databases to run the core productivity loops.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
