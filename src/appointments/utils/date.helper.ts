/**
 * Converts a Date object into a standard string format (YYYY-MM-DD) based on the local time zone.
 */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates an array of target dates (either a single date or a 14-day range) based on the local time zone.
 */
export function generateTargetDates(date?: string): Date[] {
  const targetDates: Date[] = [];

  if (date) {
    const [year, month, day] = date.split('-');
    targetDates.push(new Date(Number(year), Number(month) - 1, Number(day)));
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      targetDates.push(nextDate);
    }
  }
  return targetDates;
}

/**
 * Safely extracts and formats the date component as a standard string (YYYY-MM-DD) from either a Date object or an existing string.
 */
export function extractDateString(dateObj: Date | string): string {
  return dateObj instanceof Date
    ? dateObj.toISOString().slice(0, 10)
    : String(dateObj).slice(0, 10);
}
