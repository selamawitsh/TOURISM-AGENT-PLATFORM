import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-emerald-50 text-emerald-700';
    case 'moderate': return 'bg-amber-50 text-amber-800';
    case 'hard': return 'bg-rose-50 text-rose-700';
    default: return 'bg-gray-50 text-gray-700';
  }
}

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: 'Easy',
    moderate: 'Moderate',
    hard: 'Challenging',
  };
  return labels[difficulty?.toLowerCase()] || 'Easy';
}
