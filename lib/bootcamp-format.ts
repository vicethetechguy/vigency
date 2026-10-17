import type { Bootcamp, BootcampStatus } from './bootcamps';

const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export function formatPrice(amount: number): string {
  return amount === 0 ? 'Free' : naira.format(amount);
}

/** "Mon, 3 Nov 2026" from "2026-11-03", read as a calendar date (no time-zone shift). */
export function formatStartDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function hasStarted(date: string, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  return date < today;
}

export const STATUS_LABEL: Record<BootcampStatus, string> = {
  open: 'Registration open',
  closing: 'Closing soon',
  full: 'Fully booked',
  draft: 'Draft',
};

export function imageUrl(b: Pick<Bootcamp, 'id' | 'updatedAt'>): string {
  return `/api/bootcamps/${b.id}/image?v=${b.updatedAt}`;
}
