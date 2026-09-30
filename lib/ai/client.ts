import {
  ExtractedWorkResult,
  ProjectPlanResult,
  TaskBreakdownResult,
  DailyPlanResult,
} from './types';
import {
  deterministicExtractWork,
  deterministicPlanProject,
  deterministicBreakdownTask,
  deterministicPrioritizeTasks,
} from './deterministic';
import { Task } from '@/types';

export async function clientExtractWork(
  rawInput: string,
  inputType: 'text' | 'voice' | 'image' | 'file' = 'text'
): Promise<ExtractedWorkResult> {
  try {
    const res = await fetch('/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput, inputType }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (err) {
    console.warn('Network error calling /api/ai/extract, using local fallback:', err);
  }

  // Resilient fallback
  return deterministicExtractWork(rawInput, inputType);
}

export async function clientPlanProject(
  projectName: string,
  description: string = ''
): Promise<ProjectPlanResult> {
  try {
    const res = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName, description }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (err) {
    console.warn('Network error calling /api/ai/plan, using local fallback:', err);
  }

  return deterministicPlanProject(projectName, description);
}

export async function clientBreakdownTask(
  taskTitle: string,
  description: string = ''
): Promise<TaskBreakdownResult> {
  try {
    const res = await fetch('/api/ai/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, description }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (err) {
    console.warn('Network error calling /api/ai/breakdown, using local fallback:', err);
  }

  return deterministicBreakdownTask(taskTitle);
}

export async function clientPrioritizeTasks(tasks: Task[]): Promise<DailyPlanResult> {
  try {
    const res = await fetch('/api/ai/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (err) {
    console.warn('Network error calling /api/ai/prioritize, using local fallback:', err);
  }

  return deterministicPrioritizeTasks(tasks);
}
