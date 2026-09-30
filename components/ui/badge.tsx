import * as React from 'react';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'success' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-tight transition-colors';

  const variants = {
    default: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    urgent: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold',
    high: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    medium: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    low: 'bg-slate-100 text-slate-600 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    outline: 'bg-white text-slate-700 border border-slate-200',
    neutral: 'bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 leading-4',
    md: 'text-xs px-2.5 py-1 leading-4',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const labels: Record<TaskPriority, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const dotColors: Record<TaskPriority, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
  };

  return (
    <Badge variant={priority} className="gap-1.5 capitalize">
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[priority])} />
      {labels[priority]}
    </Badge>
  );
}
