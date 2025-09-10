
/**
 * The user has stated that all timestamps can be treated as if they are in the same timezone.
 * This function simply converts an ISO-like string to a Date object.
 */
export function toOslo(dateIso: string): Date {
  return new Date(dateIso);
}

/**
 * Calculates the difference between two dates in hours.
 * @param a The later date.
 * @param b The earlier date. If null or undefined, defaults to `a`.
 * @returns The difference in hours.
 */
export function diffHours(a: Date, b?: Date | null): number {
  const safeB = b ?? a;
  const diffMs = a.getTime() - safeB.getTime();
  return diffMs / (1000 * 60 * 60);
}
