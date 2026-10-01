'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  Image as ImageIcon,
  Flame,
  FolderKanban,
  Calendar,
  BarChart3,
  Layers,
  Zap,
  Clock,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { PriorityBadge } from '@/ui/badge';
import { clientExtractWork } from '@/lib/ai/client';
import { ExtractedWorkResult } from '@/lib/ai/types';

export default function LandingPage() {
  // Interactive Hero Demo State
  const [demoInput, setDemoInput] = useState(
    'Need to finish model evaluation and test benchmark runs before Friday. Sync with Rahul on API caching.'
  );
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<ExtractedWorkResult | null>({
    summary: 'Model validation milestone and collaborator sync on API caching headers.',
    tasks: [
      {
        title: 'Finish model evaluation and test benchmark runs',
        description: 'Execute quantitative test suites across test splits.',
        priority: 'urgent',
        dueDate: 'Friday',
        estimatedMinutes: 45,
        subtasks: ['Load checkpoint weights', 'Compute latency percentiles'],
        tags: ['eval', 'p0'],
      },
      {
        title: 'Sync with Rahul on API caching contracts',
        description: 'Establish caching TTL and error payload RFC standards.',
        priority: 'high',
        dueDate: 'Tomorrow',
        estimatedMinutes: 30,
        subtasks: ['Review error format RFC', 'Test staging token refresh'],
        tags: ['api', 'sync'],
      },
    ],
    peopleMentioned: ['Rahul'],
    deadlines: [{ label: 'Friday', date: '2026-10-02' }],
    suggestedNextAction: 'Open validation test runner for model benchmark evaluation',
    confidenceScore: 0.96,
    projectSuggestion: 'AI Portfolio & Launch',
  });

  const handleRunDemo = async () => {
    if (!demoInput.trim()) return;
    setIsDemoAnalyzing(true);
    try {
      const res = await clientExtractWork(demoInput, 'text');
      setDemoResult(res);
    } catch {
      // fallback handled
    } finally {
      setIsDemoAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">FlowBridge</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                AI
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#audiences" className="hover:text-indigo-600 transition-colors">
              Use Cases
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/app">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign in
              </Button>
            </Link>
            <Link href="/app">
              <Button size="sm" className="text-xs gap-1.5">
                <span>Start organizing</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold animate-pulse-subtle">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Intelligent Execution Layer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Turn scattered work into <span className="text-indigo-600">clear action.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            FlowBridge captures notes, ideas, meetings, screenshots and files, understands what matters, and turns them into organized work you can actually execute.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app">
              <Button size="lg" className="gap-2 text-sm shadow-md shadow-indigo-600/25">
                <span>Start using FlowBridge</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-sm">
                Explore the workflow
              </Button>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Multi-modal capture
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Private local storage
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Zero fluff
            </span>
          </div>
        </div>

        {/* 6. INTERACTIVE PRODUCT PREVIEW IN HERO */}
        <div id="demo" className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden">
            {/* Mock Header */}
            <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  Live Interactive Demo: Test FlowBridge Extraction
                </span>
              </div>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                Try typing your own note
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Demo Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Drop your scattered thought here:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="e.g. Call Rahul tomorrow about the API, finish draft before Friday"
                    className="flex-1 h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <Button
                    onClick={handleRunDemo}
                    isLoading={isDemoAnalyzing}
                    className="h-10 text-xs shrink-0 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Deconstruct with AI</span>
                  </Button>
                </div>
              </div>

              {/* Demo Live Output */}
              {demoResult && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      {demoResult.summary}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      {Math.round(demoResult.confidenceScore * 100)}% accuracy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {demoResult.tasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 leading-snug">{t.title}</p>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                          {t.dueDate && <span>Due: {t.dueDate}</span>}
                          {t.estimatedMinutes && <span>~{t.estimatedMinutes}m</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>
                      People identified:{' '}
                      <strong>
                        {demoResult.peopleMentioned.length > 0
                          ? demoResult.peopleMentioned.join(', ')
                          : 'None'}
                      </strong>
                    </span>
                    <Link
                      href="/app"
                      className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Open in Full App</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Problem</h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Modern work is fractured across too many surfaces.
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              You don't suffer from a lack of tools; you suffer from cognitive fragmentation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {['Quick Notes', 'Slack Messages', 'Whiteboard Photos', 'Meeting Transcripts', 'Tab Overload', 'Hidden Deadlines'].map(
              (item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700"
                >
                  {item}
                </div>
              )
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">FlowBridge acts as your Execution Buffer.</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Instead of jumping between six different apps and manually typing tickets, drop whatever you have into FlowBridge. We deconstruct it into structured, executable steps.
              </p>
            </div>
            <Link href="/app" className="shrink-0">
              <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500 text-xs">
                Launch Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT WORKFLOW */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Core Flow</h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            From Messy Thoughts to Completed Work
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">CAPTURE</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drop voice memos, copied notes, screenshots, or brainstorms. Zero syntax friction.
            </p>
          </Card>

          <Card className="p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">UNDERSTAND</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI parses context, deadlines, collaborators, and extracts imperative actionable tasks.
            </p>
          </Card>

          <Card className="p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">PRIORITIZE</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identifies the single highest-leverage deliverable today with concrete rationale.
            </p>
          </Card>

          <Card className="p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">EXECUTE</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enters Singular Focus Mode with sequential micro-steps and an uninterrupted timer.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. FEATURE SECTIONS */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Features</h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Real Execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Modal Capture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dictate thoughts via Web Speech API or attach whiteboard photos. FlowBridge processes natural language without rigid form fields.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Singular Focus Mode</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Breaks down intimidating deliverables into 3-5 frictionless micro-steps with dedicated Pomodoro intervals and zero distraction.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Strategic Project Planner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Input any project goal to receive structured phased milestones, dependencies, and estimated task durations.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Unified Schedule</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visual calendar connecting task deadlines, project milestone targets, and logged deep work sessions.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Genuine Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No fake vanity numbers. Computed strictly from your stored timestamps, revealing peak productivity hours and overdue bottlenecks.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Private by Design</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Persists in your browser by default with one-click JSON backup and restore. Operates smoothly with or without cloud credentials.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. AUDIENCES SECTION */}
      <section id="audiences" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Designed for Impact</h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Built for the Way High-Output People Actually Work
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-900">Developers</h4>
            <p className="text-slate-500">
              Deconstruct complex architecture requirements, RFCs, and bug backlogs into manageable sprints.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-900">Founders</h4>
            <p className="text-slate-500">
              Turn investor sync notes, pitch iterations, and hiring pipelines into prioritized daily goals.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-900">Researchers</h4>
            <p className="text-slate-500">
              Organize literature reviews, experiment runs, and draft iterations into phased milestones.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-900">Designers</h4>
            <p className="text-slate-500">
              Break down wireframe iterations, token libraries, and stakeholder feedback into clear tasks.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-900">Students</h4>
            <p className="text-slate-500">
              Transform syllabus dates, assignment rubrics, and study sessions into actionable focus blocks.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION (Clean, Honest Startup Tier) */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Pricing</h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Transparent, Developer-Friendly Productivity
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              No hidden paywalls on core execution tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Community Edition</h3>
                <p className="text-xs text-slate-500 mt-0.5">Free forever, client-first execution layer.</p>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">$0</div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Full Smart Inbox (Text, Voice, Images)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Unlimited tasks & projects
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Singular Focus Mode with timer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Local deterministic intelligence
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> JSON Backup & Restore
                </li>
              </ul>
              <Link href="/app" className="block pt-2">
                <Button variant="outline" className="w-full text-xs">
                  Start Free
                </Button>
              </Link>
            </Card>

            <Card className="p-6 space-y-4 border-indigo-600 ring-1 ring-indigo-600 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Pro & Teams</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For power users and multi-device sync.</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Popular
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                $12 <span className="text-xs font-normal text-slate-500">/ user / mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" /> Everything in Community
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" /> Cloud LLM inference (GPT-4o, Gemini)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" /> Multi-device encrypted sync
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" /> Team milestone dependencies
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" /> Advanced behavioral telemetry
                </li>
              </ul>
              <Link href="/app" className="block pt-2">
                <Button className="w-full text-xs">
                  Launch Free Trial
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Bring your work into focus.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Stop letting high-value ideas dissolve into forgotten notes. Turn scattered input into prioritized deliverables in seconds.
        </p>
        <div className="pt-2">
          <Link href="/app">
            <Button size="lg" className="gap-2 text-sm shadow-md shadow-indigo-600/25">
              <span>Start organizing with FlowBridge</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-white text-sm">FlowBridge AI</span>
            <span className="text-[10px] text-slate-500">© {new Date().getFullYear()} FlowBridge Systems Inc.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/app" className="hover:text-white transition-colors">
              Workspace
            </Link>
            <Link href="/app/inbox" className="hover:text-white transition-colors">
              Smart Inbox
            </Link>
            <Link href="/app/focus" className="hover:text-white transition-colors">
              Focus Mode
            </Link>
            <Link href="/app/settings" className="hover:text-white transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
