export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'completed' | 'canceled';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  estimatedMinutes?: number;
  projectId?: string;
  subtasks: Subtask[];
  tags: string[];
  aiRationale?: string;
  suggestedOrder?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  status: 'active' | 'completed' | 'archived';
  targetDate?: string;
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type InputCaptureType = 'text' | 'voice' | 'image' | 'file';

export interface ExtractedTaskItem {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  estimatedMinutes?: number;
  projectSuggestion?: string;
  subtasks?: string[];
  tags?: string[];
}

export interface ExtractedWork {
  summary: string;
  tasks: ExtractedTaskItem[];
  peopleMentioned: string[];
  deadlines: { label: string; date: string }[];
  suggestedNextAction: string;
  confidenceScore: number;
  projectSuggestion?: string;
}

export interface InboxItem {
  id: string;
  rawInput: string;
  inputType: InputCaptureType;
  status: 'pending' | 'processed' | 'converted' | 'discarded';
  extractedData?: ExtractedWork;
  fileMeta?: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  };
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  actualMinutesSpent: number;
  completed: boolean;
  notes?: string;
  startedAt: string;
  endedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'task' | 'milestone' | 'focus';
  priority?: TaskPriority;
  completed: boolean;
  referenceId?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'suggestion';
  metric?: string;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
}

export type ActivityEventType =
  | 'task_created'
  | 'task_completed'
  | 'inbox_captured'
  | 'focus_completed'
  | 'project_created'
  | 'ai_plan_generated';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  name: string;
  email: string;
  role: string;
  theme: 'light' | 'dark' | 'system';
  defaultFocusDuration: number;
  soundEffects: boolean;
  compactView: boolean;
}

export interface AISettings {
  provider: 'auto' | 'local' | 'openai' | 'gemini' | 'custom';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  customPromptPrefix?: string;
}
