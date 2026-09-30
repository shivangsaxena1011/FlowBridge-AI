import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffDays > 7) return formatDate(dateString);
    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === 1) return `yesterday`;
    if (diffHour > 1) return `${diffHour} hours ago`;
    if (diffHour === 1) return `1 hour ago`;
    if (diffMin > 1) return `${diffMin} mins ago`;
    return "just now";
  } catch {
    return dateString;
  }
}

export function isPastDate(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    return target < today;
  } catch {
    return false;
  }
}

export function isTodayDate(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const today = new Date();
    const target = new Date(dateString);
    return (
      today.getFullYear() === target.getFullYear() &&
      today.getMonth() === target.getMonth() &&
      today.getDate() === target.getDate()
    );
  } catch {
    return false;
  }
}
