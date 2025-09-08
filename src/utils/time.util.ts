/**
 * Convert duration string to milliseconds
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 * Examples: '1d', '24h', '30m', '60s'
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 1000 * 60 * 60 * 24 * 7; // default 7 days

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 1000 * 60;
    case 'h':
      return num * 1000 * 60 * 60;
    case 'd':
      return num * 1000 * 60 * 60 * 24;
    default:
      return 1000 * 60 * 60 * 24 * 7;
  }
}
