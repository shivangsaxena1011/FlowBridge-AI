'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  Project,
  InboxItem,
  FocusSession,
  ActivityEvent,
  UserPreferences,
  AISettings,
  TaskStatus,
  TaskPriority,
} from '@/types';
import {
  SEED_TASKS,
  SEED_PROJECTS,
  SEED_INBOX_ITEMS,
  SEED_FOCUS_SESSIONS,
  SEED_ACTIVITY,
  SEED_USER,
  SEED_AI_SETTINGS,
} from './seed';

const STORAGE_KEYS = {
  TASKS: 'flowbridge_tasks',
  PROJECTS: 'flowbridge_projects',
  INBOX: 'flowbridge_inbox',
  FOCUS: 'flowbridge_focus',
  ACTIVITY: 'flowbridge_activity',
  PREFERENCES: 'flowbridge_preferences',
  AI_SETTINGS: 'flowbridge_ai_settings',
  INITIALIZED: 'flowbridge_initialized_v1',
};

const UPDATE_EVENT = 'flowbridge:data-changed';

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key } }));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

export function initStorageIfEmpty(): void {
  if (typeof window === 'undefined') return;
  const isInitialized = window.localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    safeSet(STORAGE_KEYS.TASKS, SEED_TASKS);
    safeSet(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    safeSet(STORAGE_KEYS.INBOX, SEED_INBOX_ITEMS);
    safeSet(STORAGE_KEYS.FOCUS, SEED_FOCUS_SESSIONS);
    safeSet(STORAGE_KEYS.ACTIVITY, SEED_ACTIVITY);
    safeSet(STORAGE_KEYS.PREFERENCES, SEED_USER);
    safeSet(STORAGE_KEYS.AI_SETTINGS, SEED_AI_SETTINGS);
    window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Data store API methods
export const FlowBridgeStore = {
  // TASKS
  getTasks(): Task[] {
    return safeGet<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
  },

  saveTask(task: Task): void {
    const tasks = FlowBridgeStore.getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (existingIndex >= 0) {
      updated = [...tasks];
      updated[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...tasks];
      FlowBridgeStore.logActivity({
        id: 'act-' + Date.now(),
        type: 'task_created',
        title: `Created task "${task.title}"`,
        timestamp: new Date().toISOString(),
      });
    }
    safeSet(STORAGE_KEYS.TASKS, updated);
  },

  updateTaskStatus(id: string, status: TaskStatus): void {
    const tasks = FlowBridgeStore.getTasks();
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status, completedAt, updatedAt: new Date().toISOString() } : t
    );
    safeSet(STORAGE_KEYS.TASKS, updated);

    if (status === 'completed') {
      FlowBridgeStore.logActivity({
        id: 'act-' + Date.now(),
        type: 'task_completed',
        title: `Completed "${target.title}"`,
        timestamp: new Date().toISOString(),
      });
    }
  },

  deleteTask(id: string): void {
    const tasks = FlowBridgeStore.getTasks().filter((t) => t.id !== id);
    safeSet(STORAGE_KEYS.TASKS, tasks);
  },

  toggleSubtask(taskId: string, subtaskId: string): void {
    const tasks = FlowBridgeStore.getTasks();
    const updated = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const subtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      // Auto-update task status if all subtasks completed
      return { ...task, subtasks, updatedAt: new Date().toISOString() };
    });
    safeSet(STORAGE_KEYS.TASKS, updated);
  },

  // PROJECTS
  getProjects(): Project[] {
    return safeGet<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  },

  saveProject(project: Project): void {
    const projects = FlowBridgeStore.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    let updated: Project[];
    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...projects];
      FlowBridgeStore.logActivity({
        id: 'act-' + Date.now(),
        type: 'project_created',
        title: `Created project "${project.name}"`,
        timestamp: new Date().toISOString(),
      });
    }
    safeSet(STORAGE_KEYS.PROJECTS, updated);
  },

  deleteProject(id: string): void {
    const projects = FlowBridgeStore.getProjects().filter((p) => p.id !== id);
    safeSet(STORAGE_KEYS.PROJECTS, projects);
    // Unassign tasks belonging to this project
    const tasks = FlowBridgeStore.getTasks().map((t) =>
      t.projectId === id ? { ...t, projectId: undefined } : t
    );
    safeSet(STORAGE_KEYS.TASKS, tasks);
  },

  toggleProjectMilestone(projectId: string, milestoneId: string): void {
    const projects = FlowBridgeStore.getProjects();
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const milestones = p.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      return { ...p, milestones, updatedAt: new Date().toISOString() };
    });
    safeSet(STORAGE_KEYS.PROJECTS, updated);
  },

  // INBOX
  getInboxItems(): InboxItem[] {
    return safeGet<InboxItem[]>(STORAGE_KEYS.INBOX, SEED_INBOX_ITEMS);
  },

  saveInboxItem(item: InboxItem): void {
    const items = FlowBridgeStore.getInboxItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    let updated: InboxItem[];
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...items];
      FlowBridgeStore.logActivity({
        id: 'act-' + Date.now(),
        type: 'inbox_captured',
        title: `Captured new ${item.inputType} note`,
        timestamp: new Date().toISOString(),
      });
    }
    safeSet(STORAGE_KEYS.INBOX, updated);
  },

  deleteInboxItem(id: string): void {
    const items = FlowBridgeStore.getInboxItems().filter((i) => i.id !== id);
    safeSet(STORAGE_KEYS.INBOX, items);
  },

  // FOCUS SESSIONS
  getFocusSessions(): FocusSession[] {
    return safeGet<FocusSession[]>(STORAGE_KEYS.FOCUS, SEED_FOCUS_SESSIONS);
  },

  saveFocusSession(session: FocusSession): void {
    const sessions = FlowBridgeStore.getFocusSessions();
    const updated = [session, ...sessions];
    safeSet(STORAGE_KEYS.FOCUS, updated);

    if (session.completed) {
      FlowBridgeStore.logActivity({
        id: 'act-' + Date.now(),
        type: 'focus_completed',
        title: `Completed ${session.actualMinutesSpent}m focus on "${session.taskTitle || 'Focused Task'}"`,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // ACTIVITY
  getActivity(): ActivityEvent[] {
    return safeGet<ActivityEvent[]>(STORAGE_KEYS.ACTIVITY, SEED_ACTIVITY);
  },

  logActivity(event: ActivityEvent): void {
    const activity = FlowBridgeStore.getActivity();
    const updated = [event, ...activity.slice(0, 49)]; // Keep latest 50
    safeSet(STORAGE_KEYS.ACTIVITY, updated);
  },

  // PREFERENCES
  getUserPreferences(): UserPreferences {
    return safeGet<UserPreferences>(STORAGE_KEYS.PREFERENCES, SEED_USER);
  },

  saveUserPreferences(pref: Partial<UserPreferences>): void {
    const current = FlowBridgeStore.getUserPreferences();
    const updated = { ...current, ...pref };
    safeSet(STORAGE_KEYS.PREFERENCES, updated);
  },

  // AI SETTINGS
  getAISettings(): AISettings {
    return safeGet<AISettings>(STORAGE_KEYS.AI_SETTINGS, SEED_AI_SETTINGS);
  },

  saveAISettings(settings: Partial<AISettings>): void {
    const current = FlowBridgeStore.getAISettings();
    const updated = { ...current, ...settings };
    safeSet(STORAGE_KEYS.AI_SETTINGS, updated);
  },

  // SYSTEM / BACKUP
  resetToSeed(): void {
    if (typeof window === 'undefined') return;
    safeSet(STORAGE_KEYS.TASKS, SEED_TASKS);
    safeSet(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    safeSet(STORAGE_KEYS.INBOX, SEED_INBOX_ITEMS);
    safeSet(STORAGE_KEYS.FOCUS, SEED_FOCUS_SESSIONS);
    safeSet(STORAGE_KEYS.ACTIVITY, SEED_ACTIVITY);
    safeSet(STORAGE_KEYS.PREFERENCES, SEED_USER);
    safeSet(STORAGE_KEYS.AI_SETTINGS, SEED_AI_SETTINGS);
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    safeSet(STORAGE_KEYS.TASKS, []);
    safeSet(STORAGE_KEYS.PROJECTS, []);
    safeSet(STORAGE_KEYS.INBOX, []);
    safeSet(STORAGE_KEYS.FOCUS, []);
    safeSet(STORAGE_KEYS.ACTIVITY, []);
  },

  exportAllJson(): string {
    const data = {
      tasks: FlowBridgeStore.getTasks(),
      projects: FlowBridgeStore.getProjects(),
      inbox: FlowBridgeStore.getInboxItems(),
      focusSessions: FlowBridgeStore.getFocusSessions(),
      activity: FlowBridgeStore.getActivity(),
      preferences: FlowBridgeStore.getUserPreferences(),
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) safeSet(STORAGE_KEYS.TASKS, data.tasks);
      if (Array.isArray(data.projects)) safeSet(STORAGE_KEYS.PROJECTS, data.projects);
      if (Array.isArray(data.inbox)) safeSet(STORAGE_KEYS.INBOX, data.inbox);
      if (Array.isArray(data.focusSessions)) safeSet(STORAGE_KEYS.FOCUS, data.focusSessions);
      if (Array.isArray(data.activity)) safeSet(STORAGE_KEYS.ACTIVITY, data.activity);
      if (data.preferences) safeSet(STORAGE_KEYS.PREFERENCES, data.preferences);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  },
};

// Unified React Hook for live reactivity across all views
export function useFlowBridgeStore() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(SEED_INBOX_ITEMS);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(SEED_FOCUS_SESSIONS);
  const [activity, setActivity] = useState<ActivityEvent[]>(SEED_ACTIVITY);
  const [preferences, setPreferences] = useState<UserPreferences>(SEED_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  const reloadData = useCallback(() => {
    initStorageIfEmpty();
    setTasks(FlowBridgeStore.getTasks());
    setProjects(FlowBridgeStore.getProjects());
    setInboxItems(FlowBridgeStore.getInboxItems());
    setFocusSessions(FlowBridgeStore.getFocusSessions());
    setActivity(FlowBridgeStore.getActivity());
    setPreferences(FlowBridgeStore.getUserPreferences());
  }, []);

  useEffect(() => {
    reloadData();
    setIsHydrated(true);

    const handleStorageUpdate = () => {
      reloadData();
    };

    window.addEventListener(UPDATE_EVENT, handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [reloadData]);

  return {
    isHydrated,
    tasks,
    projects,
    inboxItems,
    focusSessions,
    activity,
    preferences,
    actions: FlowBridgeStore,
  };
}
