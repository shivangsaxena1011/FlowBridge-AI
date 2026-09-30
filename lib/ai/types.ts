import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['urgent', 'high', 'medium', 'low']);

export const ExtractedTaskItemSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().default(''),
  priority: TaskPrioritySchema.default('medium'),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().optional().default(30),
  projectSuggestion: z.string().optional(),
  subtasks: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export type ExtractedTaskItem = z.infer<typeof ExtractedTaskItemSchema>;

export const ExtractedWorkSchema = z.object({
  summary: z.string().min(1),
  tasks: z.array(ExtractedTaskItemSchema).min(1),
  peopleMentioned: z.array(z.string()).default([]),
  deadlines: z.array(
    z.object({
      label: z.string(),
      date: z.string(),
    })
  ).default([]),
  suggestedNextAction: z.string().default('Review extracted items'),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  projectSuggestion: z.string().optional(),
});

export type ExtractedWorkResult = z.infer<typeof ExtractedWorkSchema>;

export const ProjectMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  order: z.number().default(1),
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: TaskPrioritySchema.default('medium'),
      estimatedMinutes: z.number().default(45),
      dependencies: z.array(z.string()).optional().default([]),
    })
  ),
});

export const ProjectPlanSchema = z.object({
  projectName: z.string().min(1),
  executiveSummary: z.string(),
  suggestedDurationWeeks: z.number().default(4),
  milestones: z.array(ProjectMilestoneSchema).min(1),
  riskFactors: z.array(z.string()).default([]),
  keyOutcome: z.string(),
});

export type ProjectPlanResult = z.infer<typeof ProjectPlanSchema>;

export const TaskBreakdownStepSchema = z.object({
  stepNumber: z.number(),
  title: z.string().min(1),
  estimatedMinutes: z.number().default(15),
  focusTip: z.string().optional(),
});

export const TaskBreakdownSchema = z.object({
  taskTitle: z.string(),
  estimatedTotalMinutes: z.number().default(45),
  whyThisOrder: z.string().optional(),
  steps: z.array(TaskBreakdownStepSchema).min(1),
});

export type TaskBreakdownResult = z.infer<typeof TaskBreakdownSchema>;

export const DailyPriorityRankSchema = z.object({
  taskId: z.string(),
  tier: z.enum(['top_priority', 'must_finish', 'nice_to_finish', 'upcoming']),
  rationale: z.string(),
  suggestedSequence: z.number(),
});

export const DailyPlanSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  highestImpactTaskId: z.string().optional(),
  rankedTasks: z.array(DailyPriorityRankSchema),
  energyRecommendation: z.string(),
});

export type DailyPlanResult = z.infer<typeof DailyPlanSchema>;
