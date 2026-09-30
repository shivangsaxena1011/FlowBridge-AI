import {
  ExtractedWorkResult,
  ProjectPlanResult,
  TaskBreakdownResult,
  DailyPlanResult,
} from './types';
import { Task, TaskPriority } from '@/types';

// Helper to compute dynamic target dates
function getOffsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getNextDayOfWeek(dayName: string): string {
  const daysMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const targetDay = daysMap[dayName.toLowerCase()];
  if (targetDay === undefined) return getOffsetDate(2);
  const now = new Date();
  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  now.setDate(now.getDate() + diff);
  return now.toISOString().split('T')[0];
}

export function deterministicExtractWork(rawText: string, inputType: string = 'text'): ExtractedWorkResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Detect priority
  let priority: TaskPriority = 'medium';
  if (/(urgent|asap|critical|emergency|immediately|blocker)/i.test(lower)) {
    priority = 'urgent';
  } else if (/(important|high priority|must do|vital|crucial|by tomorrow)/i.test(lower)) {
    priority = 'high';
  } else if (/(low priority|when possible|someday|eventually|if time)/i.test(lower)) {
    priority = 'low';
  }

  // Detect deadlines
  const deadlines: { label: string; date: string }[] = [];
  let detectedDueDate: string | undefined = undefined;

  if (lower.includes('today') || lower.includes('tonight')) {
    const d = getOffsetDate(0);
    deadlines.push({ label: 'Today', date: d });
    detectedDueDate = d;
  } else if (lower.includes('tomorrow')) {
    const d = getOffsetDate(1);
    deadlines.push({ label: 'Tomorrow', date: d });
    detectedDueDate = d;
  } else {
    const dayMatches = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatches) {
      const d = getNextDayOfWeek(dayMatches[1]);
      deadlines.push({ label: dayMatches[1].charAt(0).toUpperCase() + dayMatches[1].slice(1), date: d });
      detectedDueDate = d;
    } else if (lower.includes('next week')) {
      const d = getOffsetDate(7);
      deadlines.push({ label: 'Next week', date: d });
      detectedDueDate = d;
    } else {
      // Default to 2 days out if not specified
      detectedDueDate = getOffsetDate(2);
    }
  }

  // Detect people
  const peopleSet = new Set<string>();
  const nameTriggers = /(?:call|meet|email|sync with|reach out to|contact|ask|message|review with|talk to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  let match;
  while ((match = nameTriggers.exec(text)) !== null) {
    if (match[1] && !['The', 'A', 'An', 'My', 'Our'].includes(match[1])) {
      peopleSet.add(match[1]);
    }
  }
  // Check common names in productivity contexts
  ['Rahul', 'Sarah', 'Alex', 'David', 'Elena', 'Michael', 'Priya', 'Jordan'].forEach((name) => {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      peopleSet.add(name);
    }
  });

  // Detect project suggestion
  let projectSuggestion: string | undefined = undefined;
  if (/ml|machine learning|model|dataset|weights|accuracy/i.test(lower)) {
    projectSuggestion = 'AI & Machine Learning';
  } else if (/paper|research|draft|thesis|citation|abstract/i.test(lower)) {
    projectSuggestion = 'Academic Research';
  } else if (/api|backend|frontend|code|repo|docker|bug|deploy/i.test(lower)) {
    projectSuggestion = 'Core Product Engineering';
  } else if (/client|pitch|contract|proposal|sales|partner/i.test(lower)) {
    projectSuggestion = 'Client Engagements';
  } else if (/design|figma|ui|ux|prototype|mockup/i.test(lower)) {
    projectSuggestion = 'Design System';
  }

  // Extract tasks from lines or multi-sentence structure
  const lines = text
    .split(/\n|\r|\.(?=\s+[A-Z])|;\s*/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((l) => l.length > 5);

  const tasks: ExtractedWorkResult['tasks'] = [];

  if (lines.length > 1) {
    // Multi-item capture
    lines.forEach((line, index) => {
      let itemPriority = priority;
      if (/(urgent|asap|blocker)/i.test(line)) itemPriority = 'urgent';
      else if (/(low|minor)/i.test(line)) itemPriority = 'low';

      const title = line.length > 80 ? line.substring(0, 77) + '...' : line;
      tasks.push({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: line.length > 80 ? line : `Extracted from capture: "${line}"`,
        priority: itemPriority,
        dueDate: detectedDueDate,
        estimatedMinutes: index === 0 ? 45 : 30,
        projectSuggestion,
        subtasks: ['Review background details', 'Execute key action item', 'Verify completion'],
        tags: [projectSuggestion ? projectSuggestion.toLowerCase().split(' ')[0] : 'actionable'],
      });
    });
  } else {
    // Single structured capture
    const cleanTitle = text.length > 80 ? text.substring(0, 77) + '...' : text;
    tasks.push({
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      description: `Original input: "${text}"`,
      priority,
      dueDate: detectedDueDate,
      estimatedMinutes: 45,
      projectSuggestion,
      subtasks: [
        'Gather necessary context and tools',
        'Complete the core deliverable',
        'Review quality and confirm next step',
      ],
      tags: ['inbox-processed', ...(projectSuggestion ? [projectSuggestion.toLowerCase().split(' ')[0]] : [])],
    });
  }

  const peopleArray = Array.from(peopleSet);
  const firstTask = tasks[0];
  const suggestedNextAction = firstTask
    ? `Begin work on: "${firstTask.title}" (${firstTask.estimatedMinutes || 30} mins)`
    : 'Review items and schedule priority work';

  let summary = `FlowBridge analyzed your ${inputType} note and organized it into ${tasks.length} actionable ${
    tasks.length === 1 ? 'task' : 'tasks'
  }.`;

  if (peopleArray.length > 0) {
    summary += ` Highlighted key collaborator(s): ${peopleArray.join(', ')}.`;
  }
  if (deadlines.length > 0) {
    summary += ` Target deadline identified: ${deadlines[0].label}.`;
  }

  return {
    summary,
    tasks,
    peopleMentioned: peopleArray,
    deadlines,
    suggestedNextAction,
    confidenceScore: 0.94,
    projectSuggestion,
  };
}

export function deterministicPlanProject(projectName: string, description: string = ''): ProjectPlanResult {
  const isSoftware = /api|app|code|software|web|frontend|backend|cloud|platform|ml|ai/i.test(projectName + ' ' + description);
  const isResearch = /research|paper|study|thesis|analysis|model|evaluation/i.test(projectName + ' ' + description);
  const isDesign = /design|ui|ux|brand|redesign|prototype|figma/i.test(projectName + ' ' + description);

  if (isResearch) {
    return {
      projectName,
      executiveSummary: `Strategic research execution roadmap structured across literature framing, methodology execution, and publication-ready documentation.`,
      suggestedDurationWeeks: 4,
      milestones: [
        {
          title: 'Milestone 1: Literature Synthesis & Problem Definition',
          description: 'Establish foundational baseline and formalize benchmarks.',
          targetDate: getOffsetDate(7),
          order: 1,
          tasks: [
            {
              title: 'Synthesize relevant recent publications and baseline metrics',
              description: 'Examine SOTA methodologies and identify evaluation criteria.',
              priority: 'high',
              estimatedMinutes: 60,
              dependencies: [],
            },
            {
              title: 'Formalize hypothesis and dataset acquisition strategy',
              description: 'Verify access to required datasets and compute infrastructure.',
              priority: 'high',
              estimatedMinutes: 45,
              dependencies: ['Synthesize relevant recent publications and baseline metrics'],
            },
          ],
        },
        {
          title: 'Milestone 2: Empirical Evaluation & Validation',
          description: 'Run experiments, validate statistical significance, and log findings.',
          targetDate: getOffsetDate(18),
          order: 2,
          tasks: [
            {
              title: 'Execute quantitative benchmark runs across test splits',
              description: 'Capture ablation studies, compute metrics, and visualize results.',
              priority: 'urgent',
              estimatedMinutes: 90,
              dependencies: ['Formalize hypothesis and dataset acquisition strategy'],
            },
            {
              title: 'Conduct failure case analysis and edge-case auditing',
              description: 'Isolate error distributions and document behavioral edge cases.',
              priority: 'medium',
              estimatedMinutes: 60,
              dependencies: ['Execute quantitative benchmark runs across test splits'],
            },
          ],
        },
        {
          title: 'Milestone 3: Manuscript Synthesis & Peer Review Preparation',
          description: 'Consolidate findings into publication format and circulate for feedback.',
          targetDate: getOffsetDate(28),
          order: 3,
          tasks: [
            {
              title: 'Draft results, discussion, and ablation figures',
              description: 'Generate vector charts and compile qualitative case studies.',
              priority: 'high',
              estimatedMinutes: 90,
              dependencies: ['Execute quantitative benchmark runs across test splits'],
            },
            {
              title: 'Complete final proofing and collaborator review cycle',
              description: 'Address peer comments and finalize manuscript repository.',
              priority: 'medium',
              estimatedMinutes: 45,
              dependencies: ['Draft results, discussion, and ablation figures'],
            },
          ],
        },
      ],
      riskFactors: [
        'Compute bottleneck during extensive ablation experiments',
        'Data distribution shifts between training and test sets',
      ],
      keyOutcome: `High-rigor publication and reproducible benchmark suite delivered on schedule.`,
    };
  }

  if (isDesign) {
    return {
      projectName,
      executiveSummary: `User-centered design architecture from exploratory user journeys to production-grade component specs.`,
      suggestedDurationWeeks: 3,
      milestones: [
        {
          title: 'Milestone 1: Discovery & User Flow Mapping',
          description: 'Define information architecture and core user paths.',
          targetDate: getOffsetDate(5),
          order: 1,
          tasks: [
            {
              title: 'Audit current friction points and competitor paradigms',
              priority: 'high',
              estimatedMinutes: 45,
              dependencies: [],
            },
            {
              title: 'Construct high-fidelity wireframe journeys for primary user tasks',
              priority: 'high',
              estimatedMinutes: 90,
              dependencies: ['Audit current friction points and competitor paradigms'],
            },
          ],
        },
        {
          title: 'Milestone 2: Design System & Interactive Prototypes',
          description: 'Establish typography, token system, and clickable flows.',
          targetDate: getOffsetDate(14),
          order: 2,
          tasks: [
            {
              title: 'Develop cohesive color, typography, and component states',
              priority: 'urgent',
              estimatedMinutes: 75,
              dependencies: ['Construct high-fidelity wireframe journeys for primary user tasks'],
            },
            {
              title: 'Assemble clickable prototype for stakeholder testing',
              priority: 'high',
              estimatedMinutes: 60,
              dependencies: ['Develop cohesive color, typography, and component states'],
            },
          ],
        },
        {
          title: 'Milestone 3: Engineering Handoff & Design QA',
          description: 'Token exports, interactive documentation, and implementation review.',
          targetDate: getOffsetDate(21),
          order: 3,
          tasks: [
            {
              title: 'Document component variations, edge states, and responsiveness',
              priority: 'medium',
              estimatedMinutes: 60,
              dependencies: ['Assemble clickable prototype for stakeholder testing'],
            },
            {
              title: 'Run joint design QA session with engineering leads',
              priority: 'medium',
              estimatedMinutes: 45,
              dependencies: ['Document component variations, edge states, and responsiveness'],
            },
          ],
        },
      ],
      riskFactors: ['Scope expansion during interactive prototype exploration', 'Fidelity drift during handoff'],
      keyOutcome: 'Delivered an intuitive, modern, production-ready interface system.',
    };
  }

  // Default Software / General Project Plan
  return {
    projectName,
    executiveSummary: `Sequential engineering plan breaking ${projectName} into measurable technical milestones and focused deliverables.`,
    suggestedDurationWeeks: 4,
    milestones: [
      {
        title: 'Milestone 1: Architecture & Technical Foundations',
        description: 'Set up repository structure, core schemas, and system contracts.',
        targetDate: getOffsetDate(7),
        order: 1,
        tasks: [
          {
            title: `Define data models, API interfaces, and system boundaries for ${projectName}`,
            priority: 'high',
            estimatedMinutes: 60,
            dependencies: [],
          },
          {
            title: 'Scaffold core service layer and local persistence verification',
            priority: 'high',
            estimatedMinutes: 60,
            dependencies: [`Define data models, API interfaces, and system boundaries for ${projectName}`],
          },
        ],
      },
      {
        title: 'Milestone 2: Core Feature Implementation',
        description: 'Build end-to-end functionality and primary user pathways.',
        targetDate: getOffsetDate(18),
        order: 2,
        tasks: [
          {
            title: 'Implement primary user workflows and responsive UI components',
            priority: 'urgent',
            estimatedMinutes: 90,
            dependencies: ['Scaffold core service layer and local persistence verification'],
          },
          {
            title: 'Connect AI processing pipelines with graceful fallback handling',
            priority: 'high',
            estimatedMinutes: 75,
            dependencies: ['Implement primary user workflows and responsive UI components'],
          },
        ],
      },
      {
        title: 'Milestone 3: Hardening, Polish & Production Release',
        description: 'End-to-end testing, performance optimization, and deployment.',
        targetDate: getOffsetDate(28),
        order: 3,
        tasks: [
          {
            title: 'Run comprehensive type checking, audit accessibility, and optimize bundle size',
            priority: 'high',
            estimatedMinutes: 45,
            dependencies: ['Connect AI processing pipelines with graceful fallback handling'],
          },
          {
            title: 'Deploy production release and verify live environment telemetry',
            priority: 'medium',
            estimatedMinutes: 30,
            dependencies: ['Run comprehensive type checking, audit accessibility, and optimize bundle size'],
          },
        ],
      },
    ],
    riskFactors: ['API rate limits or third-party service latency', 'Unforeseen edge cases in user input'],
    keyOutcome: `Fully deployed, resilient ${projectName} with verified production stability.`,
  };
}

export function deterministicBreakdownTask(taskTitle: string): TaskBreakdownResult {
  const lower = taskTitle.toLowerCase();

  let steps = [
    {
      stepNumber: 1,
      title: 'Clarify deliverables & gather relevant context',
      estimatedMinutes: 10,
      focusTip: 'Eliminate all tab clutter. Open only the single document or tool required.',
    },
    {
      stepNumber: 2,
      title: 'Execute the core heavy-lifting phase',
      estimatedMinutes: 20,
      focusTip: 'Work in a burst of flow. Do not edit or self-censor while producing the first pass.',
    },
    {
      stepNumber: 3,
      title: 'Review against quality criteria & refine details',
      estimatedMinutes: 10,
      focusTip: 'Check accuracy, formatting, and verify all sub-items are addressed.',
    },
    {
      stepNumber: 4,
      title: 'Document outcome & trigger next communication',
      estimatedMinutes: 5,
      focusTip: 'Notify stakeholders or log the completion status while the context is fresh.',
    },
  ];

  if (/report|paper|write|document|draft/i.test(lower)) {
    steps = [
      {
        stepNumber: 1,
        title: 'Outline main sections, key findings & supporting data points',
        estimatedMinutes: 10,
        focusTip: 'Structure headers before writing complete sentences to maintain narrative clarity.',
      },
      {
        stepNumber: 2,
        title: 'Draft core narrative and primary analytical arguments',
        estimatedMinutes: 25,
        focusTip: 'Maintain deep focus. Complete each section sequentially without jumping around.',
      },
      {
        stepNumber: 3,
        title: 'Insert figures, reference tables, and verify data citations',
        estimatedMinutes: 15,
        focusTip: 'Cross-check exact figures and metrics against original source runs.',
      },
      {
        stepNumber: 4,
        title: 'Polish prose, format executive summary & export final PDF/document',
        estimatedMinutes: 10,
        focusTip: 'Read the summary aloud once to catch awkward phrasing.',
      },
    ];
  } else if (/call|meet|sync|discuss| rahul| sarah/i.test(lower)) {
    steps = [
      {
        stepNumber: 1,
        title: 'Review agenda and past action items',
        estimatedMinutes: 5,
        focusTip: 'Identify the exact 1-2 decisions that must be reached by the end of the sync.',
      },
      {
        stepNumber: 2,
        title: 'Prepare bullet points and technical links to share',
        estimatedMinutes: 10,
        focusTip: 'Have relevant dashboard links or PRs pre-opened in browser tabs.',
      },
      {
        stepNumber: 3,
        title: 'Conduct discussion & record actionable decisions live',
        estimatedMinutes: 20,
        focusTip: 'Summarize agreed commitments before concluding the call.',
      },
      {
        stepNumber: 4,
        title: 'Distribute quick follow-up notes and convert action items into FlowBridge tasks',
        estimatedMinutes: 10,
        focusTip: 'Send follow-up immediately so ownership remains unambiguous.',
      },
    ];
  } else if (/deploy|build|bug|fix|code|api/i.test(lower)) {
    steps = [
      {
        stepNumber: 1,
        title: 'Reproduce problem or define target test assertion',
        estimatedMinutes: 10,
        focusTip: 'Write down expected behavior vs current behavior before touching code.',
      },
      {
        stepNumber: 2,
        title: 'Implement the targeted logic adjustment',
        estimatedMinutes: 25,
        focusTip: 'Keep changes atomic and focused on the immediate scope.',
      },
      {
        stepNumber: 3,
        title: 'Run test suite and verify build passes locally',
        estimatedMinutes: 10,
        focusTip: 'Check lint, type checking, and boundary condition tests.',
      },
      {
        stepNumber: 4,
        title: 'Create commit, trigger CI/CD pipeline & verify deployment staging',
        estimatedMinutes: 10,
        focusTip: 'Verify live logs post-deploy to confirm clean boot.',
      },
    ];
  }

  const totalMin = steps.reduce((acc, s) => acc + s.estimatedMinutes, 0);

  return {
    taskTitle,
    estimatedTotalMinutes: totalMin,
    whyThisOrder:
      'Structured to lower initial activation resistance, enter high-velocity execution quickly, and conclude with crisp verification.',
    steps,
  };
}

export function deterministicPrioritizeTasks(tasks: Task[]): DailyPlanResult {
  if (tasks.length === 0) {
    return {
      headline: 'Clear horizon for today',
      summary: 'You have no open tasks scheduled. Capture new notes in your Inbox or plan an upcoming project.',
      rankedTasks: [],
      energyRecommendation: 'A great day to plan strategic objectives or recharge.',
    };
  }

  const uncompleted = tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled');

  // Sort by urgency, deadline, and priority
  const scored = uncompleted.map((task) => {
    let score = 0;
    if (task.priority === 'urgent') score += 100;
    else if (task.priority === 'high') score += 60;
    else if (task.priority === 'medium') score += 30;
    else score += 10;

    if (task.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (task.dueDate <= today) score += 80;
      else {
        const diffDays = (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 2) score += 40;
      }
    }

    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const rankedTasks: DailyPlanResult['rankedTasks'] = [];

  scored.forEach((item, index) => {
    let tier: 'top_priority' | 'must_finish' | 'nice_to_finish' | 'upcoming';
    let rationale = '';

    if (index === 0) {
      tier = 'top_priority';
      rationale = item.task.dueDate
        ? `Highest strategic leverage with approaching deadline (${item.task.dueDate}). Completing this first unblocks downstream progress.`
        : `Marked as ${item.task.priority} priority with significant impact across your active workspace.`;
    } else if (index < 3 || item.task.priority === 'urgent') {
      tier = 'must_finish';
      rationale = `Critical operational deliverable. Scheduled for today to maintain workflow momentum and avoid deadline slippage.`;
    } else if (index < 6) {
      tier = 'nice_to_finish';
      rationale = `Valuable progress task. Execute if energy levels remain high after completing your must-finish commitments.`;
    } else {
      tier = 'upcoming';
      rationale = `Secondary priority that can safely transition to tomorrow without blocking core milestones.`;
    }

    rankedTasks.push({
      taskId: item.task.id,
      tier,
      rationale,
      suggestedSequence: index + 1,
    });
  });

  const topTask = scored[0]?.task;

  return {
    headline: topTask ? `Focus on "${topTask.title}"` : "Today's Execution Blueprint",
    summary: topTask
      ? `FlowBridge prioritized ${rankedTasks.length} active tasks. Your highest leverage work today is "${topTask.title}" to protect deadlines and prevent downstream bottlenecks.`
      : 'All pending work categorized by urgency and impact.',
    highestImpactTaskId: topTask?.id,
    rankedTasks,
    energyRecommendation:
      'Tackle your top priority during your peak focus window this morning. Reserve quick communications and admin tasks for the afternoon.',
  };
}
