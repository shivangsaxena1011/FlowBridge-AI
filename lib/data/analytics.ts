import { Task, Project, FocusSession, AIInsight } from '@/types';
import { isPastDate, isTodayDate } from '@/lib/utils';

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  completionRate: number;
  totalFocusMinutes: number;
  totalFocusSessions: number;
  priorityBreakdown: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  projectStats: {
    id: string;
    name: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }[];
  peakProductivityPeriod: string;
  insights: AIInsight[];
}

export function computeProductivityMetrics(
  tasks: Task[],
  projects: Project[],
  focusSessions: FocusSession[]
): ProductivityMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled').length;

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isPastDate(t.dueDate)
  ).length;

  const dueTodayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'canceled' && t.dueDate && isTodayDate(t.dueDate)
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Focus metrics
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.actualMinutesSpent || 0), 0);
  const totalFocusSessions = focusSessions.filter((s) => s.completed).length;

  // Priority distribution
  const priorityBreakdown = {
    urgent: tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length,
    high: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
    medium: tasks.filter((t) => t.priority === 'medium' && t.status !== 'completed').length,
    low: tasks.filter((t) => t.priority === 'low' && t.status !== 'completed').length,
  };

  // Project progress
  const projectStats = projects.map((p) => {
    const projTasks = tasks.filter((t) => t.projectId === p.id);
    const projCompleted = projTasks.filter((t) => t.status === 'completed').length;
    const percentage = projTasks.length > 0 ? Math.round((projCompleted / projTasks.length) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      totalTasks: projTasks.length,
      completedTasks: projCompleted,
      percentage,
    };
  });

  // Time of day analysis from completedAt
  const timeBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  tasks
    .filter((t) => t.completedAt)
    .forEach((t) => {
      try {
        const hour = new Date(t.completedAt!).getHours();
        if (hour >= 5 && hour < 12) timeBuckets.morning++;
        else if (hour >= 12 && hour < 17) timeBuckets.afternoon++;
        else if (hour >= 17 && hour < 22) timeBuckets.evening++;
        else timeBuckets.night++;
      } catch {
        // ignore date parse issues
      }
    });

  let peakPeriod = 'Morning';
  let maxCount = timeBuckets.morning;
  if (timeBuckets.afternoon > maxCount) {
    peakPeriod = 'Afternoon';
    maxCount = timeBuckets.afternoon;
  }
  if (timeBuckets.evening > maxCount) {
    peakPeriod = 'Evening';
    maxCount = timeBuckets.evening;
  }
  if (timeBuckets.night > maxCount) {
    peakPeriod = 'Late Night';
  }

  // Derive genuine AI Insights based strictly on real patterns
  const insights: AIInsight[] = [];

  if (overdueTasks > 0) {
    insights.push({
      id: 'ins-overdue',
      title: `${overdueTasks} Overdue ${overdueTasks === 1 ? 'Task' : 'Tasks'} Require Rescheduling`,
      description: `You have ${overdueTasks} pending task(s) past their scheduled target. Re-allocating these to Today restores velocity and prevents cognitive backlog.`,
      type: 'warning',
      metric: `${overdueTasks} overdue`,
      actionLabel: 'Review Tasks',
      actionRoute: '/app/tasks?filter=upcoming',
      createdAt: new Date().toISOString(),
    });
  }

  if (totalFocusMinutes >= 25) {
    insights.push({
      id: 'ins-focus',
      title: 'Deep Work Consistency',
      description: `You logged ${Math.round(totalFocusMinutes / 60 * 10) / 10} hours of structured focus time across ${totalFocusSessions} completed work sessions.`,
      type: 'positive',
      metric: `${totalFocusMinutes} mins deep work`,
      actionLabel: 'Start Focus Session',
      actionRoute: '/app/focus',
      createdAt: new Date().toISOString(),
    });
  }

  if (completedTasks >= 2) {
    insights.push({
      id: 'ins-peak',
      title: `Optimal Momentum in the ${peakPeriod}`,
      description: `Analysis of your timestamp history shows your highest volume of task completion occurs in the ${peakPeriod.toLowerCase()}.`,
      type: 'suggestion',
      metric: `${peakPeriod} peak`,
      actionLabel: 'Plan Daily Schedule',
      actionRoute: '/app/today',
      createdAt: new Date().toISOString(),
    });
  }

  if (priorityBreakdown.urgent > 2) {
    insights.push({
      id: 'ins-urgency',
      title: 'High Urgency Concentration',
      description: `You have ${priorityBreakdown.urgent} urgent items active simultaneously. Consider delegating or focusing strictly on one high-leverage item first.`,
      type: 'warning',
      metric: `${priorityBreakdown.urgent} urgent items`,
      actionLabel: 'Prioritize in Today',
      actionRoute: '/app/today',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    dueTodayTasks,
    completionRate,
    totalFocusMinutes,
    totalFocusSessions,
    priorityBreakdown,
    projectStats,
    peakProductivityPeriod: peakPeriod,
    insights,
  };
}
