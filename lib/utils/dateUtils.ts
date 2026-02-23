/**
 * Formats a date as "MMM DD, YYYY" (e.g., "Mar 15, 2026")
 */
export function formatDeadline(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date provided to formatDeadline");
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Checks if a deadline has passed
 */
export function isExpired(deadline: Date): boolean {
  if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
    throw new Error("Invalid date provided to isExpired");
  }
  return deadline.getTime() <= Date.now();
}

/**
 * Calculates and formats time remaining until a deadline
 * Returns null if deadline has passed
 * Formats:
 * - > 24h: "2d 5h"
 * - < 24h: "3h 45m"
 * - < 1h: "45m"
 */
export function getTimeRemaining(deadline: Date): string | null {
  if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
    throw new Error("Invalid date provided to getTimeRemaining");
  }
  const now = Date.now();
  const diff = deadline.getTime() - now;

  // Deadline has passed
  if (diff <= 0) {
    return null;
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // More than 24 hours
  if (hours >= 24) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  // Less than 24 hours but more than 1 hour
  if (hours >= 1) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  // Less than 1 hour
  return `${Math.max(1, minutes)}m`;
}
