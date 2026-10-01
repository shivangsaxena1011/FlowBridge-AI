import {
  ExtractedWorkSchema,
  ExtractedWorkResult,
  ProjectPlanSchema,
  ProjectPlanResult,
  TaskBreakdownSchema,
  TaskBreakdownResult,
  DailyPlanSchema,
  DailyPlanResult,
  TaskRefinementSchema,
  TaskRefinementResult,
} from './types';
import { safeJsonParse } from './parser';
import { AI_SYSTEM_PROMPTS } from './prompts';
import {
  deterministicExtractWork,
  deterministicPlanProject,
  deterministicBreakdownTask,
  deterministicPrioritizeTasks,
  deterministicRefineTask,
} from './deterministic';
import { Task } from '@/types';

// Server-side provider configuration
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

async function callLlmChat(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!AI_API_KEY) return null;

  try {
    const isGemini = AI_BASE_URL.includes('generativelanguage.googleapis.com') || (!process.env.AI_BASE_URL && process.env.GEMINI_API_KEY);

    if (isGemini) {
      const model = AI_MODEL.startsWith('gemini') ? AI_MODEL : 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${AI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Gemini API call failed (${response.status}):`, await response.text());
        return null;
      }

      const json = await response.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    // Default OpenAI-compatible Chat Completions
    const endpoint = `${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn(`LLM API call failed with status ${response.status}:`, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Network or configuration error in callLlmChat, falling back to local engine:', err);
    return null;
  }
}

export async function aiExtractWork(
  rawInput: string,
  inputType: 'text' | 'voice' | 'image' | 'file' = 'text'
): Promise<ExtractedWorkResult> {
  const currentDate = new Date().toISOString().split('T')[0];
  const userPrompt = `Current Date: ${currentDate}\nInput Type: ${inputType}\nRaw Input:\n"""\n${rawInput}\n"""\n\nAnalyze this input and return the structured ExtractedWork JSON object.`;

  const llmResponse = await callLlmChat(AI_SYSTEM_PROMPTS.EXTRACT_WORK, userPrompt);
  if (llmResponse) {
    const parsed = safeJsonParse(llmResponse, ExtractedWorkSchema);
    if (parsed.success) {
      return parsed.data;
    }
  }

  // Graceful deterministic fallback
  return deterministicExtractWork(rawInput, inputType);
}

export async function aiPlanProject(projectName: string, description: string = ''): Promise<ProjectPlanResult> {
  const currentDate = new Date().toISOString().split('T')[0];
  const userPrompt = `Current Date: ${currentDate}\nProject Name: "${projectName}"\nDescription/Context: "${description}"\n\nReturn the structured ProjectPlan JSON object.`;

  const llmResponse = await callLlmChat(AI_SYSTEM_PROMPTS.PLAN_PROJECT, userPrompt);
  if (llmResponse) {
    const parsed = safeJsonParse(llmResponse, ProjectPlanSchema);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return deterministicPlanProject(projectName, description);
}

export async function aiBreakdownTask(taskTitle: string, description: string = ''): Promise<TaskBreakdownResult> {
  const userPrompt = `Task Title: "${taskTitle}"\nContext/Description: "${description}"\n\nReturn the structured TaskBreakdown JSON object.`;

  const llmResponse = await callLlmChat(AI_SYSTEM_PROMPTS.BREAKDOWN_TASK, userPrompt);
  if (llmResponse) {
    const parsed = safeJsonParse(llmResponse, TaskBreakdownSchema);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return deterministicBreakdownTask(taskTitle);
}

export async function aiPrioritizeDailyTasks(tasks: Task[]): Promise<DailyPlanResult> {
  const currentDate = new Date().toISOString().split('T')[0];
  const taskSummaries = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    estimatedMinutes: t.estimatedMinutes,
  }));

  const userPrompt = `Current Date: ${currentDate}\nTasks:\n${JSON.stringify(taskSummaries, null, 2)}\n\nCategorize and rank these tasks into the structured DailyPlan JSON object.`;

  const llmResponse = await callLlmChat(AI_SYSTEM_PROMPTS.PRIORITIZE_DAILY, userPrompt);
  if (llmResponse) {
    const parsed = safeJsonParse(llmResponse, DailyPlanSchema);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return deterministicPrioritizeTasks(tasks);
}

export async function aiRefineTask(
  taskTitle: string,
  currentDescription: string = ''
): Promise<TaskRefinementResult> {
  const userPrompt = `Task Title: "${taskTitle}"\nCurrent Description: "${currentDescription}"\n\nReturn the structured TaskRefinement JSON object.`;

  const llmResponse = await callLlmChat(AI_SYSTEM_PROMPTS.REFINE_TASK, userPrompt);
  if (llmResponse) {
    const parsed = safeJsonParse(llmResponse, TaskRefinementSchema);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return deterministicRefineTask(taskTitle, currentDescription);
}
