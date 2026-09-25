/**
 * Parses date input into a midnight local Date object regardless of ISO timezone offsets.
 */
function parseLocalDate(dateInput) {
    if (dateInput instanceof Date) {
        return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 0, 0, 0, 0);
    }
    if (typeof dateInput === 'string') {
        const datePart = dateInput.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day, 0, 0, 0, 0);
        }
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Calculates working days excluding weekends (Saturday and Sunday)
 * between a start date and an end date (inclusive).
 */
function calculateWorkingDays(startDateInput, endDateInput) {
    const start = parseLocalDate(startDateInput);
    const end = parseLocalDate(endDateInput);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
    }

    if (start > end) {
        throw new Error("Start date cannot be after end date");
    }

    let workingDays = 0;
    let weekendDays = 0;
    let calendarDays = 0;

    const current = new Date(start);

    while (current <= end) {
        calendarDays++;
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday

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
        startDateNormalized: start,
        endDateNormalized: end
    };
}

module.exports = {
    parseLocalDate,
    calculateWorkingDays
};
