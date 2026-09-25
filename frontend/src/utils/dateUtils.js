/**
 * Parses date string (YYYY-MM-DD) safely into local Date at midnight
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return new Date(dateStr);
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
}

/**
 * Calculates working days (Mon-Fri) excluding weekends for date picker previews
 */
export function calculateWorkingDaysFrontend(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { workingDays: 0, weekendDays: 0, calendarDays: 0, isValid: false };
  }

  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { workingDays: 0, weekendDays: 0, calendarDays: 0, isValid: false, error: 'Invalid dates' };
  }

  if (start > end) {
    return { workingDays: 0, weekendDays: 0, calendarDays: 0, isValid: false, error: 'Start date cannot be after end date' };
  }

  let workingDays = 0;
  let weekendDays = 0;
  let calendarDays = 0;

  const current = new Date(start);

  while (current <= end) {
    calendarDays++;
    const dayOfWeek = current.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    workingDays,
    weekendDays,
    calendarDays,
    isValid: true,
    error: workingDays === 0 ? 'Selected date range contains only weekends' : null
  };
}

/**
 * Formats date into readable string like "Oct 09, 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = parseLocalDate(typeof dateInput === 'string' ? dateInput : dateInput.toISOString());
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}
