import {
  Task,
  Project,
  InboxItem,
  FocusSession,
  ActivityEvent,
  UserPreferences,
  AISettings,
} from '@/types';

// Helper to calculate relative ISO dates
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export const SEED_USER: UserPreferences = {
  name: 'Shiva',
  email: 'shiva@example.com',
  role: 'Founder & Full-Stack Lead',
  theme: 'light',
  defaultFocusDuration: 25,
  soundEffects: true,
  compactView: false,
};

export const SEED_AI_SETTINGS: AISettings = {
  provider: 'auto',
  model: 'gpt-4o-mini',
};

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'AI Portfolio & Launch',
    description: 'Autonomous agents showcase, live portfolio build, and production deployment.',
    color: '#6366f1', // Indigo
    icon: 'Layers',
    status: 'active',
    targetDate: daysFromNow(14),
    milestones: [
      {
        id: 'ms-1-1',
        title: 'System Architecture & Benchmark Verification',
        targetDate: daysFromNow(4),
        completed: false,
        order: 1,
      },
      {
        id: 'ms-1-2',
        title: 'Production UI & Responsive Experience',
        targetDate: daysFromNow(9),
        completed: false,
        order: 2,
      },
      {
        id: 'ms-1-3',
        title: 'Vercel Deployment & Launch Telemetry',
        targetDate: daysFromNow(14),
        completed: false,
        order: 3,
      },
    ],
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(12),
  },
  {
    id: 'proj-2',
    name: 'Distributed Systems Paper',
    description: 'Empirical analysis on consensus overhead in low-latency edge networks.',
    color: '#10b981', // Emerald
    icon: 'BookOpen',
    status: 'active',
    targetDate: daysFromNow(21),
    milestones: [
      {
        id: 'ms-2-1',
        title: 'Testbed Benchmark Suite',
        targetDate: daysFromNow(7),
        completed: true,
        order: 1,
      },
      {
        id: 'ms-2-2',
        title: 'Ablation Experiments & Visualizations',
        targetDate: daysFromNow(14),
        completed: false,
        order: 2,
      },
      {
        id: 'ms-2-3',
        title: 'Camera-Ready Paper Draft',
        targetDate: daysFromNow(21),
        completed: false,
        order: 3,
      },
    ],
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(24),
  },
  {
    id: 'proj-3',
    name: 'Mobile App Redesign',
    description: 'Fluid gestures, native tactile feedback, and streamlined task capture.',
    color: '#0284c7', // Sky
    icon: 'Smartphone',
    status: 'active',
    targetDate: daysFromNow(30),
    milestones: [
      {
        id: 'ms-3-1',
        title: 'Figma Token Library & Wireframes',
        targetDate: daysFromNow(10),
        completed: false,
        order: 1,
      },
      {
        id: 'ms-3-2',
        title: 'Interactive Prototype Review',
        targetDate: daysFromNow(20),
        completed: false,
        order: 2,
      },
    ],
    createdAt: hoursAgo(140),
    updatedAt: hoursAgo(48),
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finish model evaluation and test benchmark runs',
    description: 'Execute quantitative test suites across test splits and verify zero latency regression.',
    status: 'todo',
    priority: 'urgent',
    dueDate: daysFromNow(0), // Due Today!
    estimatedMinutes: 45,
    projectId: 'proj-1',
    subtasks: [
      { id: 'sub-1', title: 'Load checkpoint weights into validation runner', completed: true, createdAt: hoursAgo(2) },
      { id: 'sub-2', title: 'Run 1,000-sample automated inference pass', completed: false, createdAt: hoursAgo(2) },
      { id: 'sub-3', title: 'Plot ROC curve and compute latency percentiles', completed: false, createdAt: hoursAgo(2) },
      { id: 'sub-4', title: 'Document final metrics in project log', completed: false, createdAt: hoursAgo(2) },
    ],
    tags: ['ai-eval', 'benchmarks', 'p0'],
    aiRationale: 'Highest leverage deliverable today. Directly unblocks production deployment and stakeholder sign-off.',
    suggestedOrder: 1,
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'task-2',
    title: 'Prepare project documentation and system architecture diagram',
    description: 'Synthesize data flow diagram, service contracts, and deployment runbook for team handoff.',
    status: 'todo',
    priority: 'high',
    dueDate: daysFromNow(1), // Due Tomorrow
    estimatedMinutes: 60,
    projectId: 'proj-1',
    subtasks: [
      { id: 'sub-5', title: 'Export Mermaid diagram into vector assets', completed: true, createdAt: hoursAgo(5) },
      { id: 'sub-6', title: 'Detail environment variable configuration guide', completed: false, createdAt: hoursAgo(5) },
      { id: 'sub-7', title: 'Review security policies and rate-limiting limits', completed: false, createdAt: hoursAgo(5) },
    ],
    tags: ['docs', 'architecture'],
    aiRationale: 'Key milestone prerequisite. Clarifies system boundaries before Friday team sync.',
    suggestedOrder: 2,
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'task-3',
    title: 'Review API integration contracts with Rahul',
    description: 'Sync on token refresh cycles, error payload standards, and retry telemetry.',
    status: 'todo',
    priority: 'high',
    dueDate: daysFromNow(1),
    estimatedMinutes: 30,
    projectId: 'proj-1',
    subtasks: [
      { id: 'sub-8', title: 'Prepare schema diff between staging and production', completed: false, createdAt: hoursAgo(6) },
      { id: 'sub-9', title: 'Verify idempotency keys on payment endpoints', completed: false, createdAt: hoursAgo(6) },
    ],
    tags: ['api', 'team-sync'],
    aiRationale: 'External team dependency. Aligning early prevents blocking backend release.',
    suggestedOrder: 3,
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(6),
  },
  {
    id: 'task-4',
    title: 'Write empirical results section for paper submission',
    description: 'Draft narrative around network jitter tolerance and failure recovery times.',
    status: 'todo',
    priority: 'medium',
    dueDate: daysFromNow(3),
    estimatedMinutes: 90,
    projectId: 'proj-2',
    subtasks: [
      { id: 'sub-10', title: 'Consolidate raw CSV results into summary tables', completed: true, createdAt: hoursAgo(12) },
      { id: 'sub-11', title: 'Draft comparison subsection against baseline Raft', completed: false, createdAt: hoursAgo(12) },
      { id: 'sub-12', title: 'Send preliminary draft to co-author for comments', completed: false, createdAt: hoursAgo(12) },
    ],
    tags: ['research', 'writing'],
    aiRationale: 'Deep cognitive work best scheduled for high-energy focus block.',
    suggestedOrder: 4,
    createdAt: hoursAgo(36),
    updatedAt: hoursAgo(12),
  },
  {
    id: 'task-5',
    title: 'Audit mobile touch targets and accessibility contrast',
    description: 'Ensure 44px minimum touch targets and WCAG 2.1 AA compliant color contrast ratios.',
    status: 'todo',
    priority: 'medium',
    dueDate: daysFromNow(5),
    estimatedMinutes: 45,
    projectId: 'proj-3',
    subtasks: [
      { id: 'sub-13', title: 'Run automated Lighthouse accessibility sweep', completed: false, createdAt: hoursAgo(8) },
      { id: 'sub-14', title: 'Verify button hit-slop on small viewports (375px)', completed: false, createdAt: hoursAgo(8) },
    ],
    tags: ['ux', 'a11y'],
    suggestedOrder: 5,
    createdAt: hoursAgo(40),
    updatedAt: hoursAgo(8),
  },
  {
    id: 'task-6',
    title: 'Clean up Docker compose environment and secrets',
    description: 'Remove legacy test containers and rotate local dev service credentials.',
    status: 'todo',
    priority: 'low',
    dueDate: daysFromNow(7),
    estimatedMinutes: 20,
    subtasks: [],
    tags: ['devops', 'maintenance'],
    suggestedOrder: 6,
    createdAt: hoursAgo(50),
    updatedAt: hoursAgo(10),
  },
  {
    id: 'task-7',
    title: 'Initial architecture blueprint and prototype scaffolding',
    description: 'Set up Next.js App Router, Tailwind configuration, and component library.',
    status: 'completed',
    priority: 'high',
    dueDate: daysFromNow(-1),
    estimatedMinutes: 60,
    projectId: 'proj-1',
    subtasks: [
      { id: 'sub-15', title: 'Configure App Router layout and theme tokens', completed: true, createdAt: hoursAgo(48) },
      { id: 'sub-16', title: 'Set up type definitions and service abstractions', completed: true, createdAt: hoursAgo(48) },
    ],
    tags: ['core', 'setup'],
    completedAt: hoursAgo(6),
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(6),
  },
  {
    id: 'task-8',
    title: 'Establish literature bibliography and citation library',
    description: 'Gather 25 key citations in distributed systems and write annotated summaries.',
    status: 'completed',
    priority: 'medium',
    dueDate: daysFromNow(-2),
    estimatedMinutes: 45,
    projectId: 'proj-2',
    subtasks: [],
    tags: ['research'],
    completedAt: hoursAgo(20),
    createdAt: hoursAgo(70),
    updatedAt: hoursAgo(20),
  },
];

export const SEED_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'inbox-1',
    rawInput: 'Need to sync with Rahul tomorrow about the API response formats and verify our caching TTL.',
    inputType: 'text',
    status: 'processed',
    extractedData: {
      summary: 'API coordination sync to establish caching headers and contract formats.',
      tasks: [
        {
          title: 'Sync with Rahul on API response contracts',
          description: 'Establish caching TTL and JSON response payload standards.',
          priority: 'high',
          dueDate: daysFromNow(1),
          estimatedMinutes: 30,
          projectSuggestion: 'AI Portfolio & Launch',
          subtasks: ['List endpoints requiring caching', 'Review error format RFC'],
          tags: ['api', 'team-sync'],
        },
      ],
      peopleMentioned: ['Rahul'],
      deadlines: [{ label: 'Tomorrow', date: daysFromNow(1) }],
      suggestedNextAction: 'Review endpoint checklist before meeting Rahul',
      confidenceScore: 0.96,
      projectSuggestion: 'AI Portfolio & Launch',
    },
    createdAt: hoursAgo(3),
  },
  {
    id: 'inbox-2',
    rawInput: 'Voice note: Remember to draft the abstract for IEEE paper by Thursday afternoon. Check if Sarah reviewed section 3.',
    inputType: 'voice',
    status: 'processed',
    extractedData: {
      summary: 'Manuscript milestone deadline and collaborator check-in.',
      tasks: [
        {
          title: 'Draft IEEE conference paper abstract',
          description: 'Finalize 200-word concise abstract summarizing benchmark breakthroughs.',
          priority: 'high',
          dueDate: daysFromNow(3),
          estimatedMinutes: 40,
          projectSuggestion: 'Distributed Systems Paper',
          subtasks: ['Write problem statement', 'Highlight key latency reductions', 'Circulate to co-authors'],
          tags: ['paper', 'ieee'],
        },
      ],
      peopleMentioned: ['Sarah'],
      deadlines: [{ label: 'Thursday afternoon', date: daysFromNow(3) }],
      suggestedNextAction: 'Check in with Sarah regarding section 3 feedback',
      confidenceScore: 0.95,
      projectSuggestion: 'Distributed Systems Paper',
    },
    createdAt: hoursAgo(7),
  },
];

export const SEED_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'foc-1',
    taskId: 'task-1',
    taskTitle: 'Finish model evaluation and test benchmark runs',
    durationMinutes: 25,
    actualMinutesSpent: 25,
    completed: true,
    notes: 'Loaded model weights and set up automated evaluation pipeline.',
    startedAt: hoursAgo(4),
    endedAt: hoursAgo(3.6),
  },
  {
    id: 'foc-2',
    taskId: 'task-7',
    taskTitle: 'Initial architecture blueprint and prototype scaffolding',
    durationMinutes: 50,
    actualMinutesSpent: 48,
    completed: true,
    notes: 'Configured project core structures and verified clean build.',
    startedAt: hoursAgo(8),
    endedAt: hoursAgo(7.2),
  },
  {
    id: 'foc-3',
    taskId: 'task-8',
    taskTitle: 'Establish literature bibliography and citation library',
    durationMinutes: 25,
    actualMinutesSpent: 25,
    completed: true,
    notes: 'Curated 25 foundational citations into BibTeX.',
    startedAt: hoursAgo(22),
    endedAt: hoursAgo(21.6),
  },
];

export const SEED_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'focus_completed',
    title: 'Completed 25m Focus Session on "Finish model evaluation"',
    timestamp: hoursAgo(3.6),
  },
  {
    id: 'act-2',
    type: 'inbox_captured',
    title: 'Captured note: "Sync with Rahul tomorrow on API response formats"',
    timestamp: hoursAgo(3),
  },
  {
    id: 'act-3',
    type: 'task_completed',
    title: 'Marked "Initial architecture blueprint" as complete',
    timestamp: hoursAgo(6),
  },
  {
    id: 'act-4',
    type: 'project_created',
    title: 'Created project "AI Portfolio & Launch"',
    timestamp: hoursAgo(72),
  },
];
